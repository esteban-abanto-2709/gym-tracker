import { Locale } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  credential: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
