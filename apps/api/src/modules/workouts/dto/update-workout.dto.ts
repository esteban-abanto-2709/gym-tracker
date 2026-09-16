import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { NotWithDuration } from './create-workout.dto';

export class UpdateWorkoutDto {
  @IsOptional()
  @IsUUID()
  exerciseId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  reps?: number;

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
  @IsBoolean()
  isApproximation?: boolean;
}
