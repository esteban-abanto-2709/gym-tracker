"use client";

import { ReactNode } from "react";
import type { RoutineItem } from "@/lib/types";
import { Check } from "lucide-react";

interface GuidedExerciseRowProps {
  item: RoutineItem;
  index: number;
  done: number;
  isCurrent: boolean;
  isComplete: boolean;
  onSelect: (index: number) => void;
  children?: ReactNode;
}

export function GuidedExerciseRow({
  item,
  index,
  done,
  isCurrent,
  isComplete,
  onSelect,
  children,
}: GuidedExerciseRowProps) {
  const target = item.targetSets;

  return (
    <div
      className={`rounded-2xl border-2 transition-all ${
        isCurrent
          ? "border-primary bg-card shadow-lg shadow-primary/5"
          : "border-input bg-card/40"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(index)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
            isComplete
              ? "bg-primary text-primary-foreground"
              : isCurrent
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {isComplete ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-bold leading-tight truncate ${
              isComplete && !isCurrent ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {item.exercise.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {target ? `${target} × ${item.targetReps ?? "—"}` : "Series libres"}
          </p>
        </div>

        <span className="shrink-0 text-sm font-mono font-bold text-muted-foreground">
          {done}
          {target ? `/${target}` : ""}
        </span>
      </button>

      {isCurrent && children && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
