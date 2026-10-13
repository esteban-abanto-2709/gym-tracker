import { Locale } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsPastDate } from '@/common/date-only';

export class UpdateMeDto {
  @IsOptional()
  @IsPastDate()
  birthDate?: string | null;

  @ValidateIf((o: UpdateMeDto) => o.exerciseLocale !== undefined)
  @IsEnum(Locale)
  exerciseLocale?: Locale;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  newsOpened?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  newsSeen?: string[];
}
