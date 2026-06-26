import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { ExpenseRow, mapExpense } from '../common/utils/expense-mapper.util';
import { buildExpenseStats } from '../common/utils/expense-stats.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Resuelve a quien pertenecen los gastos: un asesor puede consultar los de
   * un usuario concreto via `userId`; cualquier otro caso usa el propio id.
   */
  private resolveOwnerId(user: AuthUser, userId?: number): number {
    if (user.role === 'advisor' && userId) {
      return Number(userId);
    }
    return user.userId;
  }

  async findAll(user: AuthUser, query: QueryExpenseDto) {
    const ownerId = this.resolveOwnerId(user, query.userId);

    const conditions = ['user_id = $1'];
    const params: unknown[] = [ownerId];
    let idx = 2;

    if (query.category) {
      conditions.push(`category = $${idx++}`);
      params.push(query.category);
    }
    if (query.month) {
      conditions.push(`EXTRACT(MONTH FROM date) = $${idx++}`);
      params.push(Number(query.month));
    }
    if (query.year) {
      conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
      params.push(Number(query.year));
    }
    if (query.commerce) {
      conditions.push(`LOWER(commerce) LIKE $${idx++}`);
      params.push(`%${String(query.commerce).toLowerCase()}%`);
    }

    const where = conditions.join(' AND ');

    // Total y suma de TODO lo que matchea el filtro (no solo la pagina actual),
    // para que el front sepa cuanto falta y muestre el monto real.
    const { rows: totals } = await this.db.query<{ total: number; total_amount: string }>(
      `SELECT COUNT(*)::int AS total, COALESCE(SUM(amount), 0) AS total_amount
       FROM expenses WHERE ${where}`,
      params,
    );
    const total = totals[0].total;
    const totalAmount = Number(totals[0].total_amount);

    // Orden por lista blanca (la columna y direccion nunca vienen crudas del SQL).
    const sortColumn = query.sort === 'amount' ? 'amount' : 'date';
    const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC';

    // Paginacion: por defecto 10 filas. `id` como desempate para que el orden
    // sea estable y la paginacion no duplique ni saltee filas con igual fecha.
    const limit = query.limit && query.limit > 0 ? Number(query.limit) : 10;
    const offset = query.offset && query.offset > 0 ? Number(query.offset) : 0;

    const dataParams = [...params, limit, offset];
    const sql =
      `SELECT * FROM expenses WHERE ${where} ` +
      `ORDER BY ${sortColumn} ${sortOrder}, id DESC ` +
      `LIMIT $${idx} OFFSET $${idx + 1}`;

    const { rows } = await this.db.query<ExpenseRow>(sql, dataParams);

    return {
      items: rows.map(mapExpense),
      total,
      totalAmount,
      limit,
      offset,
    };
  }

  async create(user: AuthUser, dto: CreateExpenseDto) {
    const expenseDate = new Date(dto.date);
    if (expenseDate > new Date()) {
      throw new BadRequestException('La fecha no puede ser futura.');
    }

    const { rows } = await this.db.query<ExpenseRow>(
      `INSERT INTO expenses (user_id, commerce, date, amount, category, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user.userId,
        String(dto.commerce).trim(),
        dto.date,
        dto.amount,
        dto.category,
        dto.description ? String(dto.description).trim() : '',
        dto.imageUrl ?? null,
      ],
    );

    return mapExpense(rows[0]);
  }

  async update(user: AuthUser, id: number, dto: UpdateExpenseDto) {
    const { rows } = await this.db.query<ExpenseRow>(
      `UPDATE expenses SET commerce = $1, date = $2, amount = $3, category = $4, description = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [
        String(dto.commerce).trim(),
        dto.date,
        dto.amount,
        dto.category,
        dto.description ? String(dto.description).trim() : '',
        id,
        user.userId,
      ],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Gasto no encontrado.');
    }

    return mapExpense(rows[0]);
  }

  async remove(user: AuthUser, id: number) {
    const { rowCount } = await this.db.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, user.userId],
    );

    if (!rowCount) {
      throw new NotFoundException('Gasto no encontrado.');
    }

    return { statusCode: 200, message: 'Gasto eliminado.' };
  }

  async stats(user: AuthUser, query: QueryExpenseDto) {
    const ownerId = this.resolveOwnerId(user, query.userId);
    const { rows } = await this.db.query<ExpenseRow>(
      'SELECT * FROM expenses WHERE user_id = $1',
      [ownerId],
    );
    return buildExpenseStats(rows.map(mapExpense));
  }
}
