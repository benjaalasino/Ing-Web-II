import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

/** Hash y comparacion de contrasenas con bcrypt. */
@Injectable()
export class PasswordService {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
