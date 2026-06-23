import { IsNotEmpty, IsString } from 'class-validator';

const REQUIRED = 'Email y password son obligatorios.';

export class LoginDto {
  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  email: string;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  password: string;
}
