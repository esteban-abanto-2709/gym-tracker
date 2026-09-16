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
import {
  LegacyBlockDto,
  RoutineBlockDto,
  blockDiscriminator,
} from './routine-block.dto';

export class RoutineItemDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(0)
  position: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineBlockDto, blockDiscriminator)
  blocks: LegacyBlockDto[];
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
