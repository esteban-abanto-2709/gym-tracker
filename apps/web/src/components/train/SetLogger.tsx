"use client";

import type { Equipment, RoutineItem } from "@/lib/types";
import { plannedSetCount, setPlan } from "@/lib/blocks";
import { SetForm, type LogSetInput } from "@/components/train/SetForm";

interface SetLoggerProps {
  item: RoutineItem;
  setIndex: number;
  replaced: boolean;
  equipment: Equipment[];
  logging: boolean;
  onLog: (args: LogSetInput) => Promise<void>;
}

export function SetLogger({
  item,
  setIndex,
  replaced,
  equipment,
  logging,
  onLog,
}: SetLoggerProps) {
  const free = plannedSetCount(item.blocks) === 0;
  return (
    <SetForm
      exerciseId={item.exerciseId}
      plan={setPlan(item.blocks, setIndex)}
      selectable={free || replaced}
      preferLastMeasure={free}
      equipment={equipment}
      logging={logging}
      onLog={onLog}
    />
  );
}
