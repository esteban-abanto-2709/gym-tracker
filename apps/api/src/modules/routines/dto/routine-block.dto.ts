import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { BLOCK_KINDS, type BlockKind } from '../blocks';

export class RoutineBlockDto {
  @IsIn(BLOCK_KINDS)
  kind: BlockKind;
}

export class LegacyBlockDto extends RoutineBlockDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  sets?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  reps?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationSec?: number | null;

  @IsOptional()
  @IsBoolean()
  approx?: boolean;
}

export const blockDiscriminator = {
  keepDiscriminatorProperty: true,
  discriminator: {
    property: 'kind',
    subTypes: [{ value: LegacyBlockDto, name: 'legacy' }],
  },
};
