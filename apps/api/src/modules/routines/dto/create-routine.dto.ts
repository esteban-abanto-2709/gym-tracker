import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { RoutineBlockDto, blockDiscriminator } from './routine-block.dto';
import type { BlockInput } from '../blocks';

export class RoutineItemDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(0)
  position: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineBlockDto, blockDiscriminator)
  blocks: BlockInput[];
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
