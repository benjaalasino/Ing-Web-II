import { IsNotEmpty, IsString } from 'class-validator';

const REQUIRED = 'Email y código son obligatorios.';

export class VerifyEmailDto {
  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  email: string;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  code: string;
}
