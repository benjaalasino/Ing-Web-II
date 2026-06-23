import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

/** Actualizacion parcial: los campos ausentes conservan su valor actual. */
export class UpdateSavingsGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetAmount?: number;

  @IsOptional()
  @IsString()
  deadline?: string | null;
}
