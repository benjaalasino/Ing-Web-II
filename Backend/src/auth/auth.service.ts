import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires_at: Date | null;
}

const GENERIC_RESEND_MESSAGE =
  'Si el email existe en nuestro sistema, te enviamos un nuevo código de verificación.';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async register(dto: RegisterDto) {
    const name = String(dto.name).trim();
    if (name.length < 2) {
      throw new BadRequestException('El nombre debe tener al menos 2 caracteres.');
    }

    if (String(dto.password).length < 6) {
      throw new BadRequestException('La contrasena debe tener al menos 6 caracteres.');
    }

    const normalizedEmail = String(dto.email).trim().toLowerCase();
    const { rows: existing } = await this.db.query('SELECT id FROM users WHERE LOWER(email) = $1', [
      normalizedEmail,
    ]);

    if (existing.length > 0) {
      throw new BadRequestException('El email ya esta registrado.');
    }

    const hashedPw = await this.passwordService.hash(String(dto.password));
    const code = this.generateCode();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.db.query(
      `INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, normalizedEmail, hashedPw, 'user', false, code, tokenExpires],
    );

    try {
      await this.emailService.sendVerificationCode(normalizedEmail, code);
    } catch (err) {
      this.logger.error(`No se pudo enviar el codigo de verificacion: ${(err as Error).message}`);
    }

    return {
      statusCode: 201,
      message: 'Cuenta creada. Te enviamos un código de 6 dígitos a tu email.',
      email: normalizedEmail,
    };
  }

  async login(dto: LoginDto) {
    const normalizedEmail = String(dto.email).trim().toLowerCase();
    const { rows } = await this.db.query<UserRow>('SELECT * FROM users WHERE LOWER(email) = $1', [
      normalizedEmail,
    ]);
    const user = rows[0];

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const isValidPassword = await this.passwordService.compare(
      String(dto.password),
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    if (!user.email_verified) {
      throw new ForbiddenException({
        statusCode: 403,
        message:
          'Debés verificar tu email antes de ingresar. Revisá tu casilla o solicitá un nuevo código.',
        unverified: true,
        email: user.email,
      });
    }

    const accessToken = this.tokenService.sign({
      userId: user.id,
      role: user.role,
      name: user.name,
    });

    return {
      access_token: accessToken,
      role: user.role,
      userId: user.id,
      name: user.name,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const normalizedEmail = String(dto.email).trim().toLowerCase();
    const { rows } = await this.db.query<UserRow>(
      'SELECT id, email_verified, verification_token, verification_token_expires_at FROM users WHERE LOWER(email) = $1',
      [normalizedEmail],
    );
    const user = rows[0];

    if (!user) {
      throw new BadRequestException('Código incorrecto.');
    }

    if (user.email_verified) {
      return { statusCode: 200, message: 'Tu email ya fue verificado. Podés iniciar sesión.' };
    }

    if (user.verification_token_expires_at && new Date(user.verification_token_expires_at) < new Date()) {
      throw new BadRequestException('El código expiró. Solicitá uno nuevo.');
    }

    if (String(dto.code).trim() !== user.verification_token) {
      throw new BadRequestException('Código incorrecto.');
    }

    await this.db.query(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1',
      [user.id],
    );

    return {
      statusCode: 200,
      message: 'Email verificado correctamente. Ya podés iniciar sesión.',
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    if (!dto.email) {
      return { statusCode: 200, message: GENERIC_RESEND_MESSAGE };
    }

    const normalizedEmail = String(dto.email).trim().toLowerCase();
    const { rows } = await this.db.query<UserRow>(
      'SELECT id, email_verified FROM users WHERE LOWER(email) = $1',
      [normalizedEmail],
    );
    const user = rows[0];

    if (!user || user.email_verified) {
      return { statusCode: 200, message: GENERIC_RESEND_MESSAGE };
    }

    const code = this.generateCode();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.db.query(
      'UPDATE users SET verification_token = $1, verification_token_expires_at = $2 WHERE id = $3',
      [code, tokenExpires, user.id],
    );

    try {
      await this.emailService.sendVerificationCode(normalizedEmail, code);
    } catch (err) {
      this.logger.error(`No se pudo enviar el codigo de verificacion: ${(err as Error).message}`);
    }

    return { statusCode: 200, message: GENERIC_RESEND_MESSAGE };
  }
}
