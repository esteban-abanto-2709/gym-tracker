import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoutineItemDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(0)
  position: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  targetSets?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  targetReps?: number | null;

  @IsOptional()
  @IsBoolean()
  isApproximation?: boolean;
}

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoutineItemDto)
  items: RoutineItemDto[];
}
