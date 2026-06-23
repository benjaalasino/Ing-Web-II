import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { DepositDto } from './dto/deposit.dto';

interface SavingsGoalRow {
  id: number;
  user_id: number;
  title: string;
  target_amount: string | number;
  current_amount: string | number;
  deadline: Date | null;
  created_at: Date;
}

const mapGoal = (row: SavingsGoalRow) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  targetAmount: Number(row.target_amount),
  currentAmount: Number(row.current_amount),
  deadline: row.deadline ? row.deadline.toISOString().split('T')[0] : null,
  createdAt: row.created_at,
});

@Injectable()
export class SavingsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(user: AuthUser) {
    const { rows } = await this.db.query<SavingsGoalRow>(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [user.userId],
    );
    return rows.map(mapGoal);
  }

  async create(user: AuthUser, dto: CreateSavingsGoalDto) {
    const title = String(dto.title).trim();
    if (!title) {
      throw new BadRequestException('El titulo es obligatorio.');
    }

    if (dto.deadline) {
      const parsedDate = new Date(dto.deadline);
      if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
        throw new BadRequestException('La fecha limite debe ser una fecha futura.');
      }
    }

    const { rows } = await this.db.query<SavingsGoalRow>(
      `INSERT INTO savings_goals (user_id, title, target_amount, deadline)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.userId, title, dto.targetAmount, dto.deadline || null],
    );

    return mapGoal(rows[0]);
  }

  async update(user: AuthUser, id: number, dto: UpdateSavingsGoalDto) {
    const { rows: existing } = await this.db.query<SavingsGoalRow>(
      'SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, user.userId],
    );

    if (existing.length === 0) {
      throw new NotFoundException('Meta no encontrada.');
    }

    const current = existing[0];
    const newTitle = dto.title !== undefined ? String(dto.title).trim() : current.title;
    const newAmount =
      dto.targetAmount !== undefined ? Number(dto.targetAmount) : Number(current.target_amount);
    const newDeadline = dto.deadline !== undefined ? dto.deadline || null : current.deadline;

    if (!newTitle) {
      throw new BadRequestException('El titulo es obligatorio.');
    }

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      throw new BadRequestException('El monto objetivo debe ser mayor a cero.');
    }

    const { rows } = await this.db.query<SavingsGoalRow>(
      `UPDATE savings_goals SET title = $1, target_amount = $2, deadline = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [newTitle, newAmount, newDeadline, id, user.userId],
    );

    return mapGoal(rows[0]);
  }

  async deposit(user: AuthUser, id: number, dto: DepositDto) {
    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount === 0) {
      throw new BadRequestException('El monto debe ser distinto de cero.');
    }

    const { rows } = await this.db.query<SavingsGoalRow>(
      `UPDATE savings_goals
       SET current_amount = GREATEST(0, current_amount + $1)
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [amount, id, user.userId],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Meta no encontrada.');
    }

    return mapGoal(rows[0]);
  }

  async remove(user: AuthUser, id: number) {
    const { rowCount } = await this.db.query(
      'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2',
      [id, user.userId],
    );

    if (!rowCount) {
      throw new NotFoundException('Meta no encontrada.');
    }

    return { statusCode: 200, message: 'Meta eliminada.' };
  }
}
