import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class QueryRecommendationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
