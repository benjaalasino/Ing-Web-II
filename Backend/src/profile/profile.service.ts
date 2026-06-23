import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PasswordService } from '../auth/password.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly db: DatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  async getProfile(userId: number) {
    const { rows } = await this.db.query<UserRow>(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [userId],
    );
    const user = rows[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { rows } = await this.db.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId]);
    const user = rows[0];

    if (dto.password !== undefined) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Debes informar la contrasena actual.');
      }

      const validCurrentPassword = await this.passwordService.compare(
        String(dto.currentPassword),
        user.password,
      );
      if (!validCurrentPassword) {
        throw new BadRequestException('Contrasena actual incorrecta.');
      }

      if (String(dto.password).length < 6) {
        throw new BadRequestException('La nueva contrasena debe tener al menos 6 caracteres.');
      }

      const hashedPw = await this.passwordService.hash(String(dto.password));
      await this.db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPw, user.id]);
      return { statusCode: 200, message: 'Contrasena actualizada.' };
    }

    if (!dto.name || !dto.email) {
      throw new BadRequestException('Nombre y email son obligatorios.');
    }

    const normalizedEmail = String(dto.email).trim().toLowerCase();
    const { rows: dupRows } = await this.db.query(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2',
      [normalizedEmail, user.id],
    );

    if (dupRows.length > 0) {
      throw new BadRequestException('Ese email ya esta en uso.');
    }

    const { rows: updated } = await this.db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role',
      [String(dto.name).trim(), normalizedEmail, user.id],
    );

    return {
      statusCode: 200,
      message: 'Perfil actualizado.',
      user: updated[0],
    };
  }
}
