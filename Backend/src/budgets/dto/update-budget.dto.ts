import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

const INVALID_AMOUNT = 'El monto debe ser mayor a cero.';

export class UpdateBudgetDto {
  @Type(() => Number)
  @IsNumber({}, { message: INVALID_AMOUNT })
  @IsPositive({ message: INVALID_AMOUNT })
  amount: number;
}
