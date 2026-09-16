import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateBy,
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

  @IsInt()
  @IsPositive()
  reps: number;

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
  @IsBoolean()
  isApproximation?: boolean;
}
