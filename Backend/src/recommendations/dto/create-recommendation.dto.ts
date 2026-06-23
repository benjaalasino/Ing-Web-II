import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

const REQUIRED = 'userId y text son obligatorios.';

export class CreateRecommendationDto {
  @Type(() => Number)
  @IsInt({ message: REQUIRED })
  userId: number;

  @IsString({ message: REQUIRED })
  @IsNotEmpty({ message: REQUIRED })
  text: string;
}
