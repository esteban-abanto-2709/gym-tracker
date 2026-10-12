import { Mechanic, Muscle } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Muscle, { each: true })
  primaryMuscles?: Muscle[];

  @IsOptional()
  @IsArray()
  @IsEnum(Muscle, { each: true })
  secondaryMuscles?: Muscle[];

  @IsOptional()
  @IsEnum(Mechanic)
  mechanic?: Mechanic;
}
