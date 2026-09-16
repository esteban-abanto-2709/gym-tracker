import type { RoutineBlock } from "@/lib/types";
import { formatDuration } from "@/lib/setDisplay";

function setsIn(block: RoutineBlock): number {
  switch (block.kind) {
    case "legacy":
      return block.sets ?? 0;
  }
}

export function plannedSetCount(blocks: RoutineBlock[]): number {
  return blocks.reduce((sum, block) => sum + setsIn(block), 0);
}

export function blockForSet(
  blocks: RoutineBlock[],
  setIndex: number,
): RoutineBlock | null {
  let remaining = setIndex;
  for (const block of blocks) {
    const sets = setsIn(block);
    if (remaining < sets) return block;
    remaining -= sets;
  }
  return blocks[blocks.length - 1] ?? null;
}

function formatBlock(block: RoutineBlock): string | null {
  switch (block.kind) {
    case "legacy": {
      if (block.sets == null) return null;
      if (block.durationSec != null) {
        const d = formatDuration(block.durationSec);
        return `${block.sets} × ${d.value} ${d.unit}`;
      }
      return `${block.sets} × ${block.reps ?? "—"}`;
    }
  }
}

export function formatBlocks(blocks: RoutineBlock[]): string | null {
  const parts = blocks
    .map(formatBlock)
    .filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" + ") : null;
}

export function formatSetGoal(block: RoutineBlock | null): string | null {
  if (!block) return null;
  switch (block.kind) {
    case "legacy":
      if (block.durationSec != null) return `${block.durationSec} s`;
      if (block.reps != null) return `${block.reps} reps`;
      return null;
  }
}
