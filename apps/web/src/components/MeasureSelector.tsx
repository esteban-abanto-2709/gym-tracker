"use client";

import { Dumbbell, Repeat, Timer } from "lucide-react";
import type { SetMeasure } from "@/lib/setDisplay";

const OPTIONS: { value: SetMeasure; label: string; Icon: typeof Dumbbell }[] = [
  { value: "weight_reps", label: "Peso × reps", Icon: Dumbbell },
  { value: "reps", label: "Solo reps", Icon: Repeat },
  { value: "time", label: "Tiempo", Icon: Timer },
];

interface MeasureSelectorProps {
  value: SetMeasure;
  onChange: (value: SetMeasure) => void;
}

export function MeasureSelector({ value, onChange }: MeasureSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="kicker text-muted-foreground text-[0.6rem]">
        Se mide en
      </label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value: option, label, Icon }) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
