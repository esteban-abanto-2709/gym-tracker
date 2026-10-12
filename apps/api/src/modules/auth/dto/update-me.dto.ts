import { Locale } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { IsPastDate } from '@/common/date-only';

export class UpdateMeDto {
  @IsOptional()
  @IsPastDate()
  birthDate?: string | null;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale | null;
}
