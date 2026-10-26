import type { ReactNode } from "react";
import { formatBlocks } from "@/lib/blocks";
import type { RoutineItem } from "@/lib/types";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

interface SnapshotRoutine {
  id: string;
  name: string;
  items: RoutineItem[];
}

export function RoutineSnapshotList<T extends SnapshotRoutine>({
  routines,
  renderAction,
}: {
  routines: T[];
  renderAction?: (routine: T) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {routines.map((routine, index) => (
        <section key={routine.id} className={cn(surfaceClass, "p-4")}>
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-secondary grid place-items-center font-display text-muted-foreground">
              {index + 1}
            </span>
            <h2 className="min-w-0 flex-1 font-bold text-foreground text-lg leading-tight truncate">
              {routine.name}
            </h2>
            {renderAction?.(routine)}
          </div>
          <ul className="mt-3 space-y-1.5">
            {routine.items.map((item) => {
              const target = formatBlocks(item.blocks);
              return (
                <li
                  key={item.id ?? item.position}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-foreground">
                    {item.exercise.name}
                  </span>
                  {target && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {target}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
