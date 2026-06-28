"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { ApproximationToggle } from "@/components/ApproximationToggle";

export interface DraftItem {
  key: string;
  exerciseId: string;
  exerciseName: string;
  equipment: string;
  targetSets: string;
  targetReps: string;
  isApproximation: boolean;
}

interface SortableExerciseItemProps {
  item: DraftItem;
  onChangeTargets: (
    key: string,
    field: "targetSets" | "targetReps",
    value: string,
  ) => void;
  onToggleApproximation: (key: string, value: boolean) => void;
  onRemove: (key: string) => void;
}

export function SortableExerciseItem({
  item,
  onChangeTargets,
  onToggleApproximation,
  onRemove,
}: SortableExerciseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-card border-2 rounded-2xl p-3 transition-colors ${
        isDragging
          ? "border-primary shadow-lg shadow-primary/10 z-10"
          : "border-input"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Reordenar ejercicio"
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground touch-none cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground leading-tight truncate">
            {item.exerciseName}
          </p>
          <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase tracking-wide">
            {item.equipment}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.key)}
          aria-label="Quitar ejercicio"
          className="shrink-0 p-2 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pl-7">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={item.targetSets}
            onChange={(e) =>
              onChangeTargets(item.key, "targetSets", e.target.value)
            }
            className="w-14 px-2 py-2 text-center font-mono bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-xl transition-all"
          />
          <span className="text-xs font-bold text-muted-foreground">series</span>
        </div>

        <span className="text-muted-foreground font-bold">×</span>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={item.targetReps}
            onChange={(e) =>
              onChangeTargets(item.key, "targetReps", e.target.value)
            }
            className="w-14 px-2 py-2 text-center font-mono bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-xl transition-all"
          />
          <span className="text-xs font-bold text-muted-foreground">reps</span>
        </div>
      </div>

      <div className="mt-3 pl-7">
        <ApproximationToggle
          checked={item.isApproximation}
          onChange={(value) => onToggleApproximation(item.key, value)}
        />
      </div>
    </div>
  );
}
