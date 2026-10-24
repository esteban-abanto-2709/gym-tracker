import { SetType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateBy,
  ValidateIf,
} from 'class-validator';

export const NotWithDuration = () =>
  ValidateBy({
    name: 'notWithDuration',
    validator: {
      validate: (_value, args) =>
        (args?.object as { durationSec?: number | null }).durationSec == null,
      defaultMessage: () => 'weight and durationSec cannot both be set',
    },
  });

export class CreateWorkoutDto {
  @IsUUID()
  exerciseId: string;

  @ValidateIf((o: { durationSec?: number | null }) => o.durationSec == null)
  @IsInt()
  @IsPositive()
  reps?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @NotWithDuration()
  weight?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationSec?: number | null;

  @IsOptional()
  @IsString()
  opinion?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;

  @IsOptional()
  @IsUUID()
  routineId?: string;

  @IsOptional()
  @IsEnum(SetType)
  setType?: SetType;

  @IsOptional()
  @IsInt()
  @IsPositive()
  step?: number;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsISO8601()
  performedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timeZone?: string;
}
