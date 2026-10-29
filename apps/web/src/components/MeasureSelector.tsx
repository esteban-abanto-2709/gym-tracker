"use client";

import { Dumbbell, Repeat, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SetMeasure } from "@/lib/setDisplay";
import { cn } from "@/lib/utils";

const OPTIONS: { value: SetMeasure; Icon: typeof Dumbbell }[] = [
  { value: "weight_reps", Icon: Dumbbell },
  { value: "reps", Icon: Repeat },
  { value: "time", Icon: Timer },
];

interface MeasureSelectorProps {
  value: SetMeasure;
  onChange: (value: SetMeasure) => void;
}

export function MeasureSelector({ value, onChange }: MeasureSelectorProps) {
  const t = useTranslations("measure");
  return (
    <div className="space-y-2">
      <label className="kicker text-muted-foreground text-4xs">
        {t("label")}
      </label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(({ value: option, Icon }) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-card text-muted-foreground hover:border-primary/50",
              )}
            >
              <Icon className="w-4 h-4" />
              {t(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
