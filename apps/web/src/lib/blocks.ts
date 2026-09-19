import type { RoutineBlock, SetType } from "@/lib/types";
import { formatDuration, type SetMeasure } from "@/lib/setDisplay";

export function blockSetCount(block: RoutineBlock): number {
  return block.kind === "ramp" ? block.steps.length : (block.sets ?? 0);
}

export function plannedSetCount(blocks: RoutineBlock[]): number {
  return blocks.reduce((sum, block) => sum + blockSetCount(block), 0);
}

function locateSet(
  blocks: RoutineBlock[],
  setIndex: number,
): { block: RoutineBlock | null; indexInBlock: number } {
  let remaining = setIndex;
  for (const block of blocks) {
    const sets = blockSetCount(block);
    if (remaining < sets) return { block, indexInBlock: remaining };
    remaining -= sets;
  }
  // Past the plan (extra sets): stay on the last block, last position.
  const last = blocks[blocks.length - 1] ?? null;
  return {
    block: last,
    indexInBlock: last ? Math.max(0, blockSetCount(last) - 1) : 0,
  };
}

function formatSeconds(totalSec: number): string {
  const d = formatDuration(totalSec);
  return `${d.value} ${d.unit}`;
}

function formatBlock(block: RoutineBlock): string | null {
  if (block.kind === "ramp") {
    return `Rampa ${block.steps.map((step) => step.reps ?? "—").join("/")}`;
  }
  if (block.sets == null) return null;
  const reps = "reps" in block ? (block.reps ?? "—") : "—";
  switch (block.kind) {
    case "time":
      return `${block.sets} × ${
        block.durationSec != null ? formatSeconds(block.durationSec) : "—"
      }`;
    case "warmup":
      return `Cal. ${block.sets} × ${reps}`;
    case "weight_reps":
    case "reps":
      return `${block.sets} × ${reps}`;
  }
}

export function formatBlocks(blocks: RoutineBlock[]): string | null {
  const parts = blocks
    .map(formatBlock)
    .filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" + ") : null;
}

export interface SetPlan {
  measure: SetMeasure;
  setType: SetType;
  approx: boolean;
  targetReps: number | null;
  targetDurationSec: number | null;
  step: number | null;
  pct: number | null;
}

export function setPlan(blocks: RoutineBlock[], setIndex: number): SetPlan {
  const plan: SetPlan = {
    measure: "weight_reps",
    setType: "WORKING",
    approx: false,
    targetReps: null,
    targetDurationSec: null,
    step: null,
    pct: null,
  };
  const { block, indexInBlock } = locateSet(blocks, setIndex);
  if (!block) return plan;
  switch (block.kind) {
    case "weight_reps":
      return { ...plan, approx: block.approx, targetReps: block.reps };
    case "reps":
      return { ...plan, measure: "reps", targetReps: block.reps };
    case "time":
      return { ...plan, measure: "time", targetDurationSec: block.durationSec };
    case "warmup":
      return { ...plan, setType: "WARMUP", targetReps: block.reps };
    case "ramp": {
      const step = block.steps[indexInBlock];
      return {
        ...plan,
        setType: "RAMP",
        targetReps: step?.reps ?? null,
        step: indexInBlock + 1,
        pct: step?.pct ?? null,
      };
    }
  }
}

export function formatSetGoal(plan: SetPlan): string | null {
  if (plan.targetDurationSec != null) return `${plan.targetDurationSec} s`;
  if (plan.targetReps == null) return null;
  if (plan.setType === "WARMUP")
    return `${plan.targetReps} reps de calentamiento`;
  if (plan.setType === "RAMP") return `${plan.targetReps} reps de rampa`;
  return `${plan.targetReps} reps`;
}
