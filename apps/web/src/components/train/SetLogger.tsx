"use client";

import type { Equipment, RoutineBlock, RoutineItem } from "@/lib/types";
import {
  LegacySetForm,
  type LogSetInput,
} from "@/components/train/LegacySetForm";

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
  switch (block?.kind ?? "legacy") {
    case "legacy":
      return (
        <LegacySetForm
          exerciseId={item.exerciseId}
          isTimed={item.exercise.isTimed ?? false}
          block={block}
          equipment={equipment}
          logging={logging}
          onLog={onLog}
        />
      );
  }
}
