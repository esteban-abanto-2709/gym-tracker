"use client";

import type { RoutineItem } from "@/lib/types";
import type { LastResult } from "@/hooks/useGuidedSession";
import { convertWeight } from "@/lib/units";
import { formatClock, formatDuration } from "@/lib/setDisplay";
import { TikTokButton } from "@/components/exercises/TikTokButton";
import {
  Check,
  ArrowRight,
  Flag,
  Dumbbell,
  PartyPopper,
  Timer,
} from "lucide-react";

export interface NextUp {
  label: string;
  name: string;
  detail: string;
}

interface SetDoneScreenProps {
  result: LastResult;
  hasPendingSets: boolean;
  nextItem: RoutineItem | null;
  nextUp: NextUp | null;
  restSec: number | null;
  onContinueSet: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function SetDoneScreen({
  result,
  hasPendingSets,
  nextItem,
  nextUp,
  restSec,
  onContinueSet,
  onNext,
  onFinish,
}: SetDoneScreenProps) {
  // Primary action follows the routine: pending target sets first, then the
  // next exercise. When the routine is finished there is no primary button.
  const duration =
    result.durationSec != null ? formatDuration(result.durationSec) : null;
  const resultLine = duration
    ? `${duration.value} ${duration.unit}`
    : result.weightKg == null
      ? `${result.reps} reps`
      : `${result.weightKg} kg (${convertWeight(result.weightKg, "kg", "lb")} lb) × ${result.reps} reps`;

  const primary = hasPendingSets
    ? { label: "Siguiente serie", onClick: onContinueSet }
    : nextItem
      ? { label: `Siguiente: ${nextItem.exercise.name}`, onClick: onNext }
      : null;

  return (
    <main className="flex-1 flex flex-col px-6 py-8 relative z-10 animate-fade-in-up">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
            <div className="relative w-11 h-11 rounded-full bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] flex items-center justify-center shadow-lg shadow-primary/30 animate-pop">
              <Check
                className="w-6 h-6 text-primary-foreground"
                strokeWidth={3.5}
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold uppercase text-2xl text-foreground leading-tight tracking-tight">
              Serie {result.setNumber} guardada
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {result.exerciseName} ·{" "}
              <span className="font-mono">{resultLine}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          {restSec != null && (
            <>
              <p className="kicker text-xs text-primary flex items-center gap-1.5">
                <Timer className="w-4 h-4" strokeWidth={2.5} />
                Llevas descansando
              </p>
              <p className="font-display font-bold text-[7rem] leading-none tracking-tight tabular-nums text-foreground mt-3">
                {formatClock(restSec)}
              </p>
            </>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {restSec != null ? "Suelta el celular." : "Suelta el celular. Descansa."}
          </p>
        </div>

        {nextUp ? (
          <div className="w-full flex items-center gap-4 rounded-2xl border-2 border-input bg-card/60 p-4 text-left animate-fade-in">
            <div className="shrink-0 p-3 bg-muted rounded-xl text-primary">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="kicker text-[0.6rem] text-primary">
                {nextUp.label}
              </p>
              <p className="font-display font-bold uppercase text-xl text-foreground leading-tight truncate">
                {nextUp.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {nextUp.detail}
              </p>
            </div>
            <TikTokButton query={nextUp.name} className="shadow-none" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-primary font-display uppercase text-xl animate-fade-in">
            <PartyPopper className="w-5 h-5" />
            ¡Rutina completada!
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-6">
          {primary && (
            <button
              type="button"
              onClick={primary.onClick}
              className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              {primary.label}
            </button>
          )}

          <button
            type="button"
            onClick={onFinish}
            className="w-full py-4 text-muted-foreground hover:text-destructive font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            Terminar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
