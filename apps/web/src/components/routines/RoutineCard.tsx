import Link from "next/link";
import type { Routine } from "@/lib/types";
import { routes } from "@/lib/routes";
import { ListChecks, Pencil, Trash2 } from "lucide-react";

interface RoutineCardProps {
  routine: Routine;
  index: number;
  onDelete: (routine: Routine) => void;
}

export function RoutineCard({ routine, index, onDelete }: RoutineCardProps) {
  const count = routine.items.length;

  return (
    <div
      className="group relative bg-card/40 backdrop-blur-sm border-2 border-input rounded-2xl p-3 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right"
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
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-1 uppercase tracking-wide">
            <ListChecks className="w-3.5 h-3.5" />
            {count} {count === 1 ? "ejercicio" : "ejercicios"}
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
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
