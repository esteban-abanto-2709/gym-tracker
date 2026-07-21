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

export class CreateWorkoutDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @IsPositive()
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsOptional()
  @IsString()
  opinion?: string;

  @IsOptional()
  @IsUUID()
  routineId?: string;

  @IsOptional()
  @IsBoolean()
  isApproximation?: boolean;
}
