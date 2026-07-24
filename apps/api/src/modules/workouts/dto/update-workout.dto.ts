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
  weight?: number;

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
