import { Locale } from '@prisma/client';
import { IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { IsPastDate } from '@/common/date-only';

export class UpdateMeDto {
  @IsOptional()
  @IsPastDate()
  birthDate?: string | null;

  @ValidateIf((o: UpdateMeDto) => o.exerciseLocale !== undefined)
  @IsEnum(Locale)
  exerciseLocale?: Locale;
}
