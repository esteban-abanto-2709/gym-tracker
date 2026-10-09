import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { IsPastDate } from '@/common/date-only';

export class UpsertMeasurementDto {
  @IsPastDate()
  date: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(20)
  @Max(400)
  weightKg?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(2)
  @Max(70)
  bodyFatPct?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(50)
  @Max(250)
  heightCm?: number | null;
}
