"use client";

import type { RoutineItem } from "@/lib/types";
import type { LastResult } from "@/hooks/useGuidedSession";
import { convertWeight } from "@/lib/units";
import { formatDuration } from "@/lib/setDisplay";
import { TikTokButton } from "@/components/exercises/TikTokButton";
import {
  Check,
  ArrowRight,
  Flag,
  Dumbbell,
  PartyPopper,
  Plus,
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
  onContinueSet: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function SetDoneScreen({
  result,
  hasPendingSets,
  nextItem,
  nextUp,
  onContinueSet,
  onNext,
  onFinish,
}: SetDoneScreenProps) {
  // Primary action follows the routine: pending target sets first, then the
  // next exercise. When the routine is finished, ending the session is.
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

  const primaryClass =
    "w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2";

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
          {nextUp ? (
            <p className="text-sm text-muted-foreground">
              Suelta el celular. Descansa.
            </p>
          ) : (
            <>
              <PartyPopper className="w-12 h-12 text-primary" />
              <p className="mt-3 font-display font-bold uppercase text-4xl text-foreground tracking-tight">
                ¡Rutina completada!
              </p>
            </>
          )}
        </div>

        {nextUp && (
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
        )}

        {/* Actions */}
        <div className="space-y-3 pt-6">
          {primary ? (
            <>
              <button
                type="button"
                onClick={primary.onClick}
                className={primaryClass}
              >
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                {primary.label}
              </button>
              <button
                type="button"
                onClick={onFinish}
                className="w-full py-4 text-muted-foreground hover:text-destructive font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-5 h-5" strokeWidth={2.5} />
                Terminar sesión
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onFinish} className={primaryClass}>
                <Flag className="w-5 h-5" strokeWidth={2.5} />
                Terminar sesión
              </button>
              <button
                type="button"
                onClick={onContinueSet}
                className="w-full py-4 rounded-2xl bg-secondary text-foreground font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Una serie extra
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
