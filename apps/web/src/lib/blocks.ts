import type { RoutineBlock, SetType } from "@/lib/types";
import { formatDuration, type SetMeasure } from "@/lib/setDisplay";

export function plannedSetCount(blocks: RoutineBlock[]): number {
  return blocks.reduce((sum, block) => sum + (block.sets ?? 0), 0);
}

export function blockForSet(
  blocks: RoutineBlock[],
  setIndex: number,
): RoutineBlock | null {
  let remaining = setIndex;
  for (const block of blocks) {
    const sets = block.sets ?? 0;
    if (remaining < sets) return block;
    remaining -= sets;
  }
  return blocks[blocks.length - 1] ?? null;
}

function formatSeconds(totalSec: number): string {
  const d = formatDuration(totalSec);
  return `${d.value} ${d.unit}`;
}

function formatBlock(block: RoutineBlock): string | null {
  if (block.sets == null) return null;
  const reps = "reps" in block ? (block.reps ?? "—") : "—";
  switch (block.kind) {
    case "legacy":
      return block.durationSec != null
        ? `${block.sets} × ${formatSeconds(block.durationSec)}`
        : `${block.sets} × ${reps}`;
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

export function formatSetGoal(block: RoutineBlock | null): string | null {
  if (!block) return null;
  const durationSec = "durationSec" in block ? block.durationSec : null;
  if (durationSec != null) return `${durationSec} s`;
  if (!("reps" in block) || block.reps == null) return null;
  return block.kind === "warmup"
    ? `${block.reps} reps de calentamiento`
    : `${block.reps} reps`;
}

export interface SetPlan {
  measure: SetMeasure;
  setType: SetType;
  showApprox: boolean;
  approx: boolean;
  targetReps: number | null;
  targetDurationSec: number | null;
}

export function setPlan(
  block: RoutineBlock | null,
  isTimed: boolean,
): SetPlan {
  const plan: SetPlan = {
    measure: "weight_reps",
    setType: "WORKING",
    showApprox: false,
    approx: false,
    targetReps: null,
    targetDurationSec: null,
  };
  if (!block || block.kind === "legacy") {
    return {
      ...plan,
      measure: isTimed ? "time" : "weight_reps",
      showApprox: !isTimed,
      approx: block?.approx ?? false,
      targetReps: block?.reps ?? null,
      targetDurationSec: block?.durationSec ?? null,
    };
  }
  switch (block.kind) {
    case "weight_reps":
      return {
        ...plan,
        showApprox: true,
        approx: block.approx,
        targetReps: block.reps,
      };
    case "reps":
      return { ...plan, measure: "reps", targetReps: block.reps };
    case "time":
      return { ...plan, measure: "time", targetDurationSec: block.durationSec };
    case "warmup":
      return { ...plan, setType: "WARMUP", targetReps: block.reps };
  }
}
