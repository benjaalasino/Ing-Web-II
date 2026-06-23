import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DepositDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser distinto de cero.' })
  amount: number;
}
