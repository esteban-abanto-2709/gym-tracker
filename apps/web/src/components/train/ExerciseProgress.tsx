"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type {
  ExerciseProgress as Progress,
  ExerciseSession,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Flame } from "lucide-react";

interface ExerciseProgressProps {
  exerciseId: string;
  routineId: string;
}

const dayFormat = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function dayLabel(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return "Hoy";
  if (day.toDateString() === yesterday.toDateString()) return "Ayer";
  return dayFormat.format(day);
}

function setsLabel(sets: ExerciseSession["sets"]) {
  const weight = sets[0]?.weight;
  if (sets.every((s) => s.weight === weight)) {
    const reps = sets.map((s) => s.reps).join(" · ");
    return weight != null ? `${weight} kg × ${reps}` : `${reps} reps`;
  }
  return sets
    .map((s) => (s.weight != null ? `${s.weight}×${s.reps}` : `${s.reps}`))
    .join(" · ");
}

function suggestionLabel(progress: Progress) {
  if (progress.suggestion === "down") return "Quizá convenga bajar el peso";
  if (progress.suggestion !== "up") return null;
  return (progress.streak ?? 0) >= 2 ? "Toca subir" : "Llegaste al tope";
}

export function ExerciseProgress({
  exerciseId,
  routineId,
}: ExerciseProgressProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<Progress>(
        routes.api.workouts.progress(
          exerciseId,
          routineId,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        ),
      )
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((e) => console.error("Error fetching exercise progress:", e));
    return () => {
      active = false;
    };
  }, [exerciseId, routineId]);

  if (
    !progress ||
    progress.streak == null ||
    !progress.sessions.some((s) => !s.free)
  )
    return null;

  const lit = progress.streak > 0;
  const suggestion = suggestionLabel(progress);
  const { target } = progress;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 border-2 transition-all active:scale-95",
          lit
            ? "border-primary bg-primary/10 text-primary"
            : "border-input text-muted-foreground/60",
        )}
        aria-label="Ver historial del ejercicio"
      >
        <Flame className={cn("w-5 h-5", lit && "fill-current")} />
        <span className="font-display font-bold text-lg tabular-nums leading-none">
          {progress.streak}
        </span>
      </button>

      {suggestion && (
        <p
          className={cn(
            "basis-full flex items-center gap-1.5 text-sm font-bold",
            progress.suggestion === "up" ? "text-primary" : "text-muted-foreground",
          )}
        >
          {progress.suggestion === "up" ? (
            <ArrowUp className="w-4 h-4" strokeWidth={3} />
          ) : (
            <ArrowDown className="w-4 h-4" strokeWidth={3} />
          )}
          {suggestion}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight text-2xl flex items-center gap-2">
              <Flame
                className={cn(
                  "w-6 h-6",
                  lit ? "text-primary fill-current" : "text-muted-foreground",
                )}
              />
              Historial · {progress.streak}
            </DialogTitle>
            {target && (
              <p className="kicker text-[0.6rem] text-muted-foreground">
                Meta {target.sets} × {target.reps}
                {target.repsMax != null && target.repsMax !== target.reps
                  ? `-${target.repsMax}`
                  : ""}
              </p>
            )}
          </DialogHeader>

          {suggestion && (
            <p className="text-sm font-bold text-foreground">{suggestion}</p>
          )}

          <ul className="space-y-2">
            {progress.sessions.map((session) => (
              <li
                key={`${session.date}-${session.free}-${session.equipmentId}`}
                className={cn(
                  "rounded-xl border-2 border-input bg-card/60 px-4 py-3",
                  session.free && "opacity-60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground capitalize">
                    {dayLabel(session.date)}
                  </span>
                  <span className="flex gap-1.5">
                    {session.free && (
                      <span className="kicker text-[0.55rem] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                        Día libre
                      </span>
                    )}
                    {session.equipment && (
                      <span className="kicker text-[0.55rem] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                        {session.equipment}
                      </span>
                    )}
                  </span>
                </div>
                <p className="font-mono text-sm text-muted-foreground mt-1">
                  {setsLabel(session.sets)}
                </p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
