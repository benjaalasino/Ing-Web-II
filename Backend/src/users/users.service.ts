import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ExpenseRow, mapExpense } from '../common/utils/expense-mapper.util';
import { buildExpenseStats } from '../common/utils/expense-stats.util';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    const { rows } = await this.db.query<UserRow>(
      "SELECT id, name, email, role, created_at FROM users WHERE role = 'user' ORDER BY id",
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      createdAt: r.created_at,
    }));
  }

  async findOne(id: number) {
    const { rows } = await this.db.query<UserRow>(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND role = 'user'",
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const u = rows[0];
    return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at };
  }

  async stats(id: number) {
    const { rows: userRows } = await this.db.query<UserRow>(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND role = 'user'",
      [id],
    );

    if (userRows.length === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const u = userRows[0];
    const { rows: expRows } = await this.db.query<ExpenseRow>(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [id],
    );
    const expenses = expRows.map(mapExpense);

    return {
      user: { id: u.id, name: u.name, email: u.email, createdAt: u.created_at },
      stats: buildExpenseStats(expenses),
      expenses,
    };
  }
}
