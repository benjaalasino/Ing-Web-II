import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

/** Filtros, orden y paginacion del listado de gastos. */
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

  /** Cantidad maxima de filas a devolver (paginacion). Por defecto 10. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /** Desplazamiento para la paginacion (cuantas filas saltear). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  /** Columna por la que ordenar. Solo se permiten valores conocidos. */
  @IsOptional()
  @IsIn(['date', 'amount'])
  sort?: 'date' | 'amount';

  /** Direccion del orden. */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  /** Solo lo usan los asesores para consultar gastos de un usuario concreto. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
