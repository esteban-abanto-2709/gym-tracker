import Link from "next/link";
import type { Routine } from "@/lib/types";
import { routes } from "@/lib/routes";
import { ListChecks, Pencil, Trash2, Play } from "lucide-react";
import { Button, buttonVariants } from "@/components/base/button";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

interface RoutineCardProps {
  routine: Routine;
  index: number;
  isNext?: boolean;
  onStart: (routine: Routine) => void;
  onDelete: (routine: Routine) => void;
}

export function RoutineCard({
  routine,
  index,
  isNext = false,
  onStart,
  onDelete,
}: RoutineCardProps) {
  const count = routine.items.length;

  return (
    <div
      className={cn(
        surfaceClass,
        "group relative p-3 overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right",
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-linear-to-b from-brand-start to-brand-end rounded-r-full" />

      <div className="pl-3 flex items-center justify-between gap-3">
        <Link
          href={routes.routineEdit(routine.id)}
          className="min-w-0 flex-1"
          title="Editar rutina"
        >
          {isNext && (
            <span className="block kicker text-4xs text-primary mb-1">
              Hoy toca
            </span>
          )}
          <h3 className="font-bold text-foreground text-lg leading-tight truncate">
            {routine.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 kicker text-4xs text-muted-foreground mt-1.5">
            <ListChecks className="w-3.5 h-3.5" />
            {count} {count === 1 ? "ejercicio" : "ejercicios"}
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="icon"
            onClick={() => onStart(routine)}
            disabled={count === 0}
            className="shadow-md hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            title="Empezar Rutina"
            aria-label="Empezar Rutina"
          >
            <Play className="w-4 h-4" strokeWidth={3} />
          </Button>
          <Link
            href={routes.routineEdit(routine.id)}
            className={buttonVariants({ variant: "muted", size: "icon" })}
            title="Editar Rutina"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <Button
            variant="danger"
            size="icon"
            onClick={() => onDelete(routine)}
            title="Eliminar Rutina"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
