import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { getMonthYear } from '../common/utils/date.util';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { QueryBudgetDto } from './dto/query-budget.dto';

interface BudgetRow {
  id: number;
  user_id: number;
  category: string;
  amount: string | number;
  month: number;
  year: number;
  created_at: Date;
}

const mapBudget = (row: BudgetRow) => ({
  id: row.id,
  userId: row.user_id,
  category: row.category,
  amount: Number(row.amount),
  month: row.month,
  year: row.year,
  createdAt: row.created_at,
});

interface BudgetProgress {
  budgetId: number;
  category: string;
  budgetAmount: number;
  spent: number;
  percentage: number;
}

interface BudgetPrediction {
  budgetId: number;
  category: string;
  budgetAmount: number;
  spent: number;
  dailyRate: number;
  projectedTotal: number;
  daysUntilOver: number | null;
  daysRemaining: number;
  status: string;
}

@Injectable()
export class BudgetsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser, query: QueryBudgetDto) {
    const fallback = getMonthYear();
    const month = Number(query.month || fallback.month);
    const year = Number(query.year || fallback.year);

    const { rows } = await this.db.query<BudgetRow>(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [user.userId, month, year],
    );
    return rows.map(mapBudget);
  }

  async create(user: AuthUser, dto: CreateBudgetDto) {
    const { rows: dup } = await this.db.query(
      'SELECT id FROM budgets WHERE user_id = $1 AND category = $2 AND month = $3 AND year = $4',
      [user.userId, dto.category, Number(dto.month), Number(dto.year)],
    );

    if (dup.length > 0) {
      throw new BadRequestException('Ya tenes un presupuesto para esa categoria en este mes.');
    }

    const { rows } = await this.db.query<BudgetRow>(
      `INSERT INTO budgets (user_id, category, amount, month, year) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.userId, dto.category, dto.amount, Number(dto.month), Number(dto.year)],
    );

    return mapBudget(rows[0]);
  }

  async update(user: AuthUser, id: number, dto: UpdateBudgetDto) {
    const { rows } = await this.db.query<BudgetRow>(
      'UPDATE budgets SET amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [dto.amount, id, user.userId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Presupuesto no encontrado.');
    }

    return mapBudget(rows[0]);
  }

  async remove(user: AuthUser, id: number) {
    const { rowCount } = await this.db.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
      [id, user.userId],
    );

    if (!rowCount) {
      throw new NotFoundException('Presupuesto no encontrado.');
    }

    return { statusCode: 200, message: 'Presupuesto eliminado.' };
  }

  async progress(user: AuthUser, query: QueryBudgetDto) {
    const fallback = getMonthYear();
    const month = Number(query.month || fallback.month);
    const year = Number(query.year || fallback.year);

    const { rows: userBudgets } = await this.db.query<BudgetRow>(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [user.userId, month, year],
    );

    const result: BudgetProgress[] = [];
    for (const budget of userBudgets) {
      const { rows: spentRows } = await this.db.query<{ spent: string }>(
        `SELECT COALESCE(SUM(amount), 0) AS spent FROM expenses
         WHERE user_id = $1 AND category = $2 AND EXTRACT(MONTH FROM date) = $3 AND EXTRACT(YEAR FROM date) = $4`,
        [user.userId, budget.category, month, year],
      );
      const spent = Number(spentRows[0].spent);
      const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

      result.push({
        budgetId: budget.id,
        category: budget.category,
        budgetAmount: Number(budget.amount),
        spent,
        percentage,
      });
    }

    return result;
  }

  async predictions(user: AuthUser, query: QueryBudgetDto) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const month = Number(query.month || currentMonth);
    const year = Number(query.year || currentYear);

    if (month !== currentMonth || year !== currentYear) {
      return [];
    }

    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const { rows: userBudgets } = await this.db.query<BudgetRow>(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [user.userId, month, year],
    );

    const predictions: BudgetPrediction[] = [];
    for (const budget of userBudgets) {
      const { rows: spentRows } = await this.db.query<{ spent: string }>(
        `SELECT COALESCE(SUM(amount), 0) AS spent FROM expenses
         WHERE user_id = $1 AND category = $2 AND EXTRACT(MONTH FROM date) = $3 AND EXTRACT(YEAR FROM date) = $4`,
        [user.userId, budget.category, month, year],
      );

      const spent = Number(spentRows[0].spent);
      const budgetAmount = Number(budget.amount);
      const dailyRate = dayOfMonth > 0 ? spent / dayOfMonth : 0;
      const projectedTotal = dailyRate * totalDaysInMonth;
      const daysUntilOver = dailyRate > 0 ? (budgetAmount - spent) / dailyRate : null;

      let status = 'on_track';
      if (projectedTotal > budgetAmount) {
        status = 'danger';
      } else if (projectedTotal > budgetAmount * 0.85) {
        status = 'warning';
      }

      if (daysUntilOver !== null && daysUntilOver < 5 && daysUntilOver >= 0) {
        status = 'danger';
      }

      predictions.push({
        budgetId: budget.id,
        category: budget.category,
        budgetAmount,
        spent,
        dailyRate: Math.round(dailyRate),
        projectedTotal: Math.round(projectedTotal),
        daysUntilOver: daysUntilOver !== null ? Math.max(0, Math.round(daysUntilOver)) : null,
        daysRemaining: totalDaysInMonth - dayOfMonth,
        status,
      });
    }

    return predictions.filter((p) => p.status !== 'on_track' || p.projectedTotal > 0);
  }
}
