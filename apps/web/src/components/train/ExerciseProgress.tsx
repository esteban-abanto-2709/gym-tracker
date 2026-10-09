"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/setDisplay";
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

const PAGE = 4;

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
  if (sets[0]?.durationSec != null) {
    return sets
      .map((s) => {
        const d = formatDuration(s.durationSec ?? 0);
        return `${d.value} ${d.unit}`;
      })
      .join(" · ");
  }
  const weight = sets[0]?.weight;
  if (sets.every((s) => s.weight === weight)) {
    const reps = sets.map((s) => s.reps).join(" · ");
    return weight != null ? `${weight} kg × ${reps}` : `${reps} reps`;
  }
  return sets
    .map((s) => (s.weight != null ? `${s.weight}×${s.reps}` : `${s.reps}`))
    .join(" · ");
}

function suggestionText(progress: Progress) {
  if (progress.suggestion === "down")
    return "Quedaste por debajo del piso: quizá convenga bajar el peso.";
  if (progress.suggestion !== "up") return null;
  return (progress.streak ?? 0) >= 2
    ? "Varias sesiones al tope: toca subir."
    : "Llegaste al tope. Si se sintió limpio, sube.";
}

function badgeArrow(progress: Progress) {
  if (progress.suggestion === "down") return "down";
  if (progress.suggestion === "up" && (progress.streak ?? 0) >= 2) return "up";
  return null;
}

export function ExerciseProgress({
  exerciseId,
  routineId,
}: ExerciseProgressProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);

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
  const suggestion = suggestionText(progress);
  const { target, sessions } = progress;
  const arrow = badgeArrow(progress);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShown(PAGE);
          setOpen(true);
        }}
        className={cn(
          "absolute -top-4 right-4 flex items-center gap-1.5 rounded-full border-2 bg-card pl-2.5 pr-3 py-1 shadow-lg transition-all active:scale-95 animate-pop",
          lit
            ? "border-primary text-primary shadow-primary/30"
            : "border-input text-muted-foreground/70",
        )}
        aria-label="Ver historial del ejercicio"
      >
        <Flame className={cn("w-4 h-4", lit && "fill-current")} />
        <span className="font-display font-bold text-lg tabular-nums leading-none">
          {progress.streak}
        </span>
        {arrow && (
          <span
            className={cn(
              "flex items-center border-l-2 pl-1.5 ml-0.5",
              arrow === "up"
                ? "border-primary/40"
                : "border-input text-muted-foreground",
            )}
          >
            {arrow === "up" ? (
              <ArrowUp className="w-4 h-4" strokeWidth={3} />
            ) : (
              <ArrowDown className="w-4 h-4" strokeWidth={3} />
            )}
          </span>
        )}
      </button>

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
            <p
              className={cn(
                "text-sm font-bold",
                progress.suggestion === "up"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {suggestion}
            </p>
          )}

          <ul className="space-y-2">
            {sessions.slice(0, shown).map((session) => (
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

          {shown < sessions.length && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="mx-auto text-sm font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Mostrar más
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
