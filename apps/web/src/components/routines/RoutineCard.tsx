import Link from "next/link";
import type { Routine } from "@/lib/types";
import { routes } from "@/lib/routes";
import { ListChecks, Pencil, Trash2, Play } from "lucide-react";

interface RoutineCardProps {
  routine: Routine;
  index: number;
  onStart: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
}

export function RoutineCard({
  routine,
  index,
  onStart,
  onDelete,
}: RoutineCardProps) {
  const count = routine.items.length;

  return (
    <div
      className="group relative bg-card border-2 border-input rounded-2xl p-3 overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-linear-to-b from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-r-full" />

      <div className="pl-3 flex items-center justify-between gap-3">
        <Link
          href={routes.routineEdit(routine.id)}
          className="min-w-0 flex-1"
          title="Editar rutina"
        >
          <h3 className="font-bold text-foreground text-lg leading-tight truncate">
            {routine.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 kicker text-[0.6rem] text-muted-foreground mt-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            {count} {count === 1 ? "ejercicio" : "ejercicios"}
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onStart(routine)}
            disabled={count === 0}
            className="flex items-center justify-center p-2.5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Empezar Rutina"
            aria-label="Empezar Rutina"
          >
            <Play className="w-4 h-4" strokeWidth={3} />
          </button>
          <Link
            href={routes.routineEdit(routine.id)}
            className="p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-xl bg-muted/30 hover:bg-muted"
            title="Editar Rutina"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(routine)}
            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-xl bg-muted/30 hover:bg-destructive/10"
            title="Eliminar Rutina"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
