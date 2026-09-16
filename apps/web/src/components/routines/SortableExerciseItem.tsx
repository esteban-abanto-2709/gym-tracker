"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import { ApproximationToggle } from "@/components/ApproximationToggle";

export interface DraftBlock {
  key: string;
  kind: "legacy";
  sets: string;
  reps: string;
  durationSec: string;
  approx: boolean;
}

export interface DraftItem {
  key: string;
  exerciseId: string;
  exerciseName: string;
  isTimed: boolean;
  blocks: DraftBlock[];
}

interface SortableExerciseItemProps {
  item: DraftItem;
  index: number;
  onChangeBlock: (
    itemKey: string,
    blockKey: string,
    patch: Partial<DraftBlock>,
  ) => void;
  onAddBlock: (itemKey: string) => void;
  onRemoveBlock: (itemKey: string, blockKey: string) => void;
  onRemove: (key: string) => void;
}

const numberInputClass =
  "w-14 px-2 py-2 text-center font-mono bg-muted border-2 border-transparent focus:border-primary focus:bg-background outline-none rounded-xl transition-all";

export function SortableExerciseItem({
  item,
  index,
  onChangeBlock,
  onAddBlock,
  onRemoveBlock,
  onRemove,
}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

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

        <span className="shrink-0 w-6 text-center font-display text-lg text-muted-foreground/60 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground leading-tight truncate">
            {item.exerciseName}
          </p>
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

      <div className="mt-3 pl-7 space-y-2">
        {item.blocks.length === 0 && (
          <p className="text-xs text-muted-foreground">Series libres</p>
        )}

        {item.blocks.map((block) => (
          <div
            key={block.key}
            className="rounded-xl border border-border/60 p-2 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={block.sets}
                  onChange={(e) =>
                    onChangeBlock(item.key, block.key, {
                      sets: e.target.value,
                    })
                  }
                  className={numberInputClass}
                />
                <span className="text-xs font-bold text-muted-foreground">
                  series
                </span>
              </div>

              <span className="text-muted-foreground font-bold">×</span>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={item.isTimed ? block.durationSec : block.reps}
                  onChange={(e) =>
                    onChangeBlock(
                      item.key,
                      block.key,
                      item.isTimed
                        ? { durationSec: e.target.value }
                        : { reps: e.target.value },
                    )
                  }
                  className={numberInputClass}
                />
                <span className="text-xs font-bold text-muted-foreground">
                  {item.isTimed ? "seg" : "reps"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRemoveBlock(item.key, block.key)}
                aria-label="Quitar bloque"
                className="ml-auto shrink-0 p-1.5 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {!item.isTimed && (
              <ApproximationToggle
                checked={block.approx}
                onChange={(value) =>
                  onChangeBlock(item.key, block.key, { approx: value })
                }
              />
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => onAddBlock(item.key)}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          Agregar bloque
        </button>
      </div>
    </div>
  );
}
