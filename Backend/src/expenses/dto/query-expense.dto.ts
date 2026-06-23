import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/** Filtros opcionales para el listado de gastos. */
export class QueryExpenseDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  commerce?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  /** Solo lo usan los asesores para consultar gastos de un usuario concreto. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
