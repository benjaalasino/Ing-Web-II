import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { TokenService } from '../token.service';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

interface UserRow {
  id: number;
  role: string;
  name: string;
}

/**
 * Equivalente al middleware `requireAuth`: valida el JWT del header
 * Authorization, confirma que el usuario siga existiendo y adjunta
 * `request.user` con sus datos.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
      throw new UnauthorizedException('Token no provisto.');
    }

    let payload: AuthUser;
    try {
      payload = this.tokenService.verify(token);
    } catch {
      throw new UnauthorizedException('Token invalido o expirado.');
    }

    const { rows } = await this.db.query<UserRow>(
      'SELECT id, role, name FROM users WHERE id = $1',
      [payload.userId],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    const user = rows[0];
    request.user = { userId: user.id, role: user.role, name: user.name };
    return true;
  }
}
