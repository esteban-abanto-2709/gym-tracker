"use client";

import type { RoutineItem } from "@/lib/types";
import type { LastResult } from "@/hooks/useGuidedSession";
import { convertWeight } from "@/lib/units";
import { Check, ArrowRight, Plus, Flag, Dumbbell, PartyPopper } from "lucide-react";

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
  onAddExercise: () => void;
  onFinish: () => void;
}

export function SetDoneScreen({
  result,
  hasPendingSets,
  nextItem,
  nextUp,
  onContinueSet,
  onNext,
  onAddExercise,
  onFinish,
}: SetDoneScreenProps) {
  // Primary action follows the routine: pending target sets first, then the
  // next exercise. When the routine is finished there is no primary button.
  const primary = hasPendingSets
    ? { label: "Siguiente serie", onClick: onContinueSet }
    : nextItem
      ? { label: `Siguiente: ${nextItem.exercise.name}`, onClick: onNext }
      : null;

  return (
    <main className="flex-1 flex flex-col px-6 py-8 relative z-10 animate-fade-in-up">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Confirmation — vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 flex items-center justify-center mb-5">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
            <span className="absolute inset-0 rounded-full bg-primary/15" />
            <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] flex items-center justify-center shadow-lg shadow-primary/30 animate-pop">
              <Check className="w-9 h-9 text-primary-foreground" strokeWidth={3.5} />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">
            ¡Serie {result.setNumber} registrada!
          </p>
          <p className="text-base font-bold text-muted-foreground mt-1">
            {result.exerciseName}
          </p>
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            {result.weightKg} kg ({convertWeight(result.weightKg, "kg", "lb")} lb)
            × {result.reps} reps
          </p>
          {result.suggestedWeight != null && (
            <p className="mt-3 text-sm font-bold text-primary">
              🔼 Recomendamos subir el peso a {result.suggestedWeight} kg
            </p>
          )}

          {/* What's coming next — set up the next machine at a glance */}
          {nextUp ? (
            <div className="mt-7 w-full flex items-center gap-4 rounded-2xl border-2 border-input bg-card/60 p-4 text-left animate-fade-in">
              <div className="shrink-0 p-3 bg-muted rounded-xl text-primary">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-primary uppercase tracking-wide">
                  {nextUp.label}
                </p>
                <p className="font-bold text-lg text-foreground leading-tight truncate">
                  {nextUp.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {nextUp.detail}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 flex items-center gap-2 text-primary font-bold animate-fade-in">
              <PartyPopper className="w-5 h-5" />
              ¡Rutina completada!
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-8">
          {primary && (
            <button
              type="button"
              onClick={primary.onClick}
              className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              {primary.label}
            </button>
          )}

          <button
            type="button"
            onClick={onAddExercise}
            className="w-full py-4 bg-card border-2 border-input text-foreground rounded-2xl font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={2.5} />
            Otro ejercicio
          </button>

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
