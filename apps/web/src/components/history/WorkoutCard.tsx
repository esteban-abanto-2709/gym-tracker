import type { Workout } from "@/lib/types";
import { RotateCcw, MessageSquare, Pencil, Trash2 } from "lucide-react";

interface WorkoutCardProps {
  workout: Workout;
  index: number;
  onRepeat: (workout: Workout) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}

export function WorkoutCard({
  workout,
  index,
  onRepeat,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  return (
    <div
      className="group relative bg-card/40 backdrop-blur-sm border-2 border-input rounded-2xl p-3 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Brand Accent Line */}
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-linear-to-b from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-r-full" />

      <div className="pl-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {workout.exercise.name}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {new Date(workout.createdAt).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <button
            onClick={() => onRepeat(workout)}
            className="flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl text-[10px] font-black shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={3} />
            Repetir
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">
                {workout.weight}
              </span>
              <span className="text-xs font-bold text-muted-foreground">kg</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-foreground">
                {workout.reps}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                reps
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(workout)}
              className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-xl bg-muted/30 hover:bg-muted"
              title="Editar Set"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(workout)}
              className="p-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-xl bg-muted/30 hover:bg-destructive/10"
              title="Eliminar Set"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {workout.opinion && (
          <div className="flex gap-2 items-start text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50 mt-3">
            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
            <p className="italic leading-snug">
              &ldquo;{workout.opinion}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
