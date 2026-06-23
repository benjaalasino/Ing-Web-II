import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CATEGORIES } from '../../common/constants/categories';

const REQUIRED = 'Comercio, fecha, monto y categoria son obligatorios.';

export class UpdateExpenseDto {
  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  commerce: string;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  date: string;

  @Type(() => Number)
  @IsNumber({}, { message: REQUIRED })
  @IsPositive({ message: 'El monto debe ser mayor a cero.' })
  amount: number;

  @IsNotEmpty({ message: REQUIRED })
  @IsIn(CATEGORIES as unknown as string[], { message: 'La categoria no es valida.' })
  category: string;

  @IsOptional()
  @IsString()
  description?: string;
}
