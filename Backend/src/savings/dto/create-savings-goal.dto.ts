import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString({ message: 'El titulo es obligatorio.' })
  @IsNotEmpty({ message: 'El titulo es obligatorio.' })
  title: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El monto objetivo debe ser mayor a cero.' })
  @IsPositive({ message: 'El monto objetivo debe ser mayor a cero.' })
  targetAmount: number;

  @IsOptional()
  @IsString()
  deadline?: string;
}
