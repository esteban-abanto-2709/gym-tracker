import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { normalizeEmail } from '../email';

export class DeleteMeDto {
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @Transform(normalizeEmail)
  @IsString()
  email?: string;
}
