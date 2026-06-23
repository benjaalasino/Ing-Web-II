import { IsOptional, IsString } from 'class-validator';

export class ResendVerificationDto {
  @IsOptional()
  @IsString()
  email?: string;
}
