import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateWorkoutDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @IsPositive()
  reps: number;

  @ValidateIf((o: CreateWorkoutDto) => o.durationSec == null)
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationSec?: number;

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
