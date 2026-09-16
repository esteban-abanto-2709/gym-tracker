"use client";

import type { Equipment, RoutineBlock, RoutineItem } from "@/lib/types";
import { setPlan } from "@/lib/blocks";
import { SetForm, type LogSetInput } from "@/components/train/SetForm";

interface SetLoggerProps {
  item: RoutineItem;
  block: RoutineBlock | null;
  equipment: Equipment[];
  logging: boolean;
  onLog: (args: LogSetInput) => Promise<void>;
}

export function SetLogger({
  item,
  block,
  equipment,
  logging,
  onLog,
}: SetLoggerProps) {
  return (
    <SetForm
      exerciseId={item.exerciseId}
      plan={setPlan(block, item.exercise.isTimed ?? false)}
      equipment={equipment}
      logging={logging}
      onLog={onLog}
    />
  );
}
