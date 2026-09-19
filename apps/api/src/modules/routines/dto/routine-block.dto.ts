import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { BLOCK_KINDS, type BlockKind } from '../blocks';

const Count = () => applyDecorators(IsOptional(), IsInt(), IsPositive());
const Flag = () => applyDecorators(IsOptional(), IsBoolean());

export class RoutineBlockDto {
  @IsIn(BLOCK_KINDS)
  kind: BlockKind;
}

export class WeightRepsBlockDto extends RoutineBlockDto {
  @Count() sets?: number | null;
  @Count() reps?: number | null;
  @Flag() approx?: boolean;
}

export class RepsBlockDto extends RoutineBlockDto {
  @Count() sets?: number | null;
  @Count() reps?: number | null;
}

export class TimeBlockDto extends RoutineBlockDto {
  @Count() sets?: number | null;
  @Count() durationSec?: number | null;
}

export class WarmupBlockDto extends RoutineBlockDto {
  @Count() sets?: number | null;
  @Count() reps?: number | null;
}

export class RampStepDto {
  @Count() reps?: number | null;
  @Count() pct?: number | null;
}

export class RampBlockDto extends RoutineBlockDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RampStepDto)
  steps: RampStepDto[];
}

export const blockDiscriminator = {
  keepDiscriminatorProperty: true,
  discriminator: {
    property: 'kind',
    subTypes: [
      { value: WeightRepsBlockDto, name: 'weight_reps' },
      { value: RepsBlockDto, name: 'reps' },
      { value: TimeBlockDto, name: 'time' },
      { value: WarmupBlockDto, name: 'warmup' },
      { value: RampBlockDto, name: 'ramp' },
    ],
  },
};
