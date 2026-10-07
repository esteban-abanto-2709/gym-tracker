"use client";

import { useMemo } from "react";
import type { Equipment, RoutineItem } from "@/lib/types";
import { pendingRampSteps, plannedSetCount, setPlan } from "@/lib/blocks";
import { SetForm, type LogSetInput } from "@/components/train/SetForm";
import { RampForm } from "@/components/train/RampForm";

interface SetLoggerProps {
  item: RoutineItem;
  setIndex: number;
  replaced: boolean;
  equipment: Equipment[];
  logging: boolean;
  onLog: (args: LogSetInput) => Promise<void>;
  onLogRamp: (sets: LogSetInput[]) => Promise<void>;
}

export function SetLogger({
  item,
  setIndex,
  replaced,
  equipment,
  logging,
  onLog,
  onLogRamp,
}: SetLoggerProps) {
  const free = plannedSetCount(item.blocks) === 0;
  const rampSteps = useMemo(
    () => pendingRampSteps(item.blocks, setIndex),
    [item.blocks, setIndex],
  );

  if (rampSteps.length > 0) {
    return (
      <RampForm
        exerciseId={item.exerciseId}
        steps={rampSteps}
        equipment={equipment}
        logging={logging}
        onLog={onLogRamp}
      />
    );
  }

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
