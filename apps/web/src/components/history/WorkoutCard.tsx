import { Fragment } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Workout } from "@/lib/types";
import { setMetrics } from "@/lib/setDisplay";
import { RotateCcw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/base/button";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("history");
  const locale = useLocale();
  return (
    <div
      className={cn(
        surfaceClass,
        "group relative p-3 overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-in-right",
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Brand Accent Line */}
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-linear-to-b from-brand-start to-brand-end rounded-r-full" />

      <div className="pl-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {workout.exercise.name}
            </h3>
            <span className="text-3xs font-mono text-muted-foreground tracking-wide">
              {new Date(workout.createdAt).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <Button
            size="icon"
            onClick={() => onRepeat(workout)}
            aria-label={t("repeatSet")}
            title={t("repeatSet")}
            className="flex shadow-md hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={3} />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-baseline gap-4">
            {setMetrics(workout).map((metric, i) => (
              <Fragment key={metric.unit}>
                {i > 0 && <div className="h-4 w-px bg-border" />}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-foreground">
                    {metric.value}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="muted"
              size="icon"
              onClick={() => onEdit(workout)}
              title={t("editSet")}
              aria-label={t("editSet")}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="danger"
              size="icon"
              onClick={() => onDelete(workout)}
              title={t("deleteSet")}
              aria-label={t("deleteSet")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
