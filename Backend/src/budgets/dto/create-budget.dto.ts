import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { CATEGORIES } from '../../common/constants/categories';

const REQUIRED = 'Categoria, monto, mes y ano son obligatorios.';

export class CreateBudgetDto {
  @IsNotEmpty({ message: REQUIRED })
  @IsIn(CATEGORIES as unknown as string[], { message: 'Categoria invalida.' })
  category: string;

  @Type(() => Number)
  @IsNumber({}, { message: REQUIRED })
  @IsPositive({ message: 'El monto debe ser mayor a cero.' })
  amount: number;

  @Type(() => Number)
  @IsInt({ message: REQUIRED })
  month: number;

  @Type(() => Number)
  @IsInt({ message: REQUIRED })
  year: number;
}
