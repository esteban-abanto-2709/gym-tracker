import { applyDecorators } from '@nestjs/common';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { BLOCK_KINDS, type BlockKind } from '../blocks';

const Count = () => applyDecorators(IsOptional(), IsInt(), IsPositive());
const Flag = () => applyDecorators(IsOptional(), IsBoolean());

export class RoutineBlockDto {
  @IsIn(BLOCK_KINDS)
  kind: BlockKind;
}

export class LegacyBlockDto extends RoutineBlockDto {
  @Count() sets?: number | null;
  @Count() reps?: number | null;
  @Count() durationSec?: number | null;
  @Flag() approx?: boolean;
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

export const blockDiscriminator = {
  keepDiscriminatorProperty: true,
  discriminator: {
    property: 'kind',
    subTypes: [
      { value: LegacyBlockDto, name: 'legacy' },
      { value: WeightRepsBlockDto, name: 'weight_reps' },
      { value: RepsBlockDto, name: 'reps' },
      { value: TimeBlockDto, name: 'time' },
      { value: WarmupBlockDto, name: 'warmup' },
    ],
  },
};
