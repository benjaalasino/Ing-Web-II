import { IsNotEmpty, IsString } from 'class-validator';

const REQUIRED = 'Nombre, email y password son obligatorios.';

export class RegisterDto {
  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  name: string;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  email: string;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  password: string;
}
