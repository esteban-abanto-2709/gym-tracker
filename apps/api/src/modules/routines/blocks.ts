export const BLOCK_KINDS = ['legacy'] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export type LegacyBlock = {
  kind: 'legacy';
  sets: number | null;
  reps: number | null;
  durationSec: number | null;
  approx: boolean;
};

export type RoutineBlock = LegacyBlock;

export function legacyBlock(fields: {
  sets?: number | null;
  reps?: number | null;
  durationSec?: number | null;
  approx?: boolean;
}): LegacyBlock {
  return {
    kind: 'legacy',
    sets: fields.sets ?? null,
    reps: fields.reps ?? null,
    durationSec: fields.durationSec ?? null,
    approx: fields.approx ?? false,
  };
}
