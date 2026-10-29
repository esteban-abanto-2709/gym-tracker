import { Locale, Theme } from '@prisma/client';
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

  @ValidateIf((o: UpdateMeDto) => o.interfaceLocale !== undefined)
  @IsEnum(Locale)
  interfaceLocale?: Locale;

  @ValidateIf((o: UpdateMeDto) => o.theme !== undefined)
  @IsEnum(Theme)
  theme?: Theme;

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
