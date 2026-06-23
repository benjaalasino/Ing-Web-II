import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from '../common/interfaces/auth-user.interface';

export interface TokenPayload {
  userId: number;
  role: string;
  name: string;
}

/** Emision y verificacion de JWT de acceso. */
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '12h' });
  }

  verify(token: string): AuthUser {
    const payload = this.jwtService.verify<TokenPayload>(token);
    return { userId: payload.userId, role: payload.role, name: payload.name };
  }
}
