export const BLOCK_KINDS = ['weight_reps', 'reps', 'time', 'warmup'] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

export type WeightRepsBlock = {
  kind: 'weight_reps';
  sets: number | null;
  reps: number | null;
  approx: boolean;
};

export type RepsBlock = {
  kind: 'reps';
  sets: number | null;
  reps: number | null;
};

export type TimeBlock = {
  kind: 'time';
  sets: number | null;
  durationSec: number | null;
};

export type WarmupBlock = {
  kind: 'warmup';
  sets: number | null;
  reps: number | null;
};

export type RoutineBlock = WeightRepsBlock | RepsBlock | TimeBlock | WarmupBlock;

export type BlockInput = {
  kind: BlockKind;
  sets?: number | null;
  reps?: number | null;
  durationSec?: number | null;
  approx?: boolean;
};

export function normalizeBlock(block: BlockInput): RoutineBlock {
  const sets = block.sets ?? null;
  const reps = block.reps ?? null;
  switch (block.kind) {
    case 'weight_reps':
      return { kind: 'weight_reps', sets, reps, approx: block.approx ?? false };
    case 'reps':
      return { kind: 'reps', sets, reps };
    case 'time':
      return { kind: 'time', sets, durationSec: block.durationSec ?? null };
    case 'warmup':
      return { kind: 'warmup', sets, reps };
  }
}
