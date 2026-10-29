"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { GripVertical, Plus, X } from "lucide-react";
import type { RoutineBlock } from "@/lib/types";
import { DurationField } from "@/components/DurationPicker";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";

const KINDS: DraftBlock["kind"][] = [
  "weight_reps",
  "reps",
  "time",
  "warmup",
  "ramp",
];

const usesSeconds = (block: DraftBlock) => block.kind === "time";

const usesRepRange = (block: DraftBlock) =>
  block.kind === "weight_reps" || block.kind === "reps";

const patchStep = (
  steps: DraftStep[],
  index: number,
  patch: Partial<DraftStep>,
): DraftStep[] =>
  steps.map((step, i) => (i === index ? { ...step, ...patch } : step));

export interface DraftStep {
  reps: string;
  pct: string;
}

export interface DraftBlock {
  key: string;
  kind: RoutineBlock["kind"];
  sets: string;
  reps: string;
  repsMax: string;
  durationSec: string;
  steps: DraftStep[];
}

export interface DraftItem {
  key: string;
  exerciseId: string;
  exerciseName: string;
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
  const t = useTranslations("routines.item");
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
      className={cn(
        "relative bg-card border-2 rounded-2xl p-3 transition-colors",
        isDragging
          ? "border-primary shadow-lg shadow-primary/10 z-10"
          : "border-input",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t("reorder")}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground touch-none cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <span className="shrink-0 w-6 text-center font-display text-lg text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground leading-tight truncate">
            {item.exerciseName}
          </p>
        </div>

        <Button
          variant="remove"
          size="icon-round"
          type="button"
          onClick={() => onRemove(item.key)}
          aria-label={t("remove")}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-3 pl-7 space-y-2">
        {item.blocks.length === 0 && (
          <p className="text-xs text-muted-foreground">{t("freeSets")}</p>
        )}

        {item.blocks.map((block) => (
          <div
            key={block.key}
            className="rounded-xl border border-border/60 p-2 space-y-2"
          >
            <div className="flex items-center gap-2">
              <select
                value={block.kind}
                onChange={(e) =>
                  onChangeBlock(item.key, block.key, {
                    kind: e.target.value as DraftBlock["kind"],
                  })
                }
                aria-label={t("blockKind")}
                className="min-w-0 flex-1 bg-muted rounded-lg px-2 py-1 text-base font-bold text-foreground outline-none border-2 border-transparent focus:border-primary transition-colors"
              >
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {t(`kinds.${kind}`)}
                  </option>
                ))}
              </select>

              <Button
                variant="remove"
                size="icon-round"
                type="button"
                onClick={() => onRemoveBlock(item.key, block.key)}
                aria-label={t("removeBlock")}
                className="shrink-0 p-1.5"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {block.kind === "ramp" ? (
              <div className="space-y-2">
                {block.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold text-muted-foreground tabular-nums">
                      {stepIndex + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={step.reps}
                        onChange={(e) =>
                          onChangeBlock(item.key, block.key, {
                            steps: patchStep(block.steps, stepIndex, {
                              reps: e.target.value,
                            }),
                          })
                        }
                        aria-label={t("stepReps", { step: stepIndex + 1 })}
                        className={numberInputClass}
                      />
                      <span className="text-xs font-bold text-muted-foreground">
                        reps
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={step.pct}
                        onChange={(e) =>
                          onChangeBlock(item.key, block.key, {
                            steps: patchStep(block.steps, stepIndex, {
                              pct: e.target.value,
                            }),
                          })
                        }
                        aria-label={t("stepPercent", { step: stepIndex + 1 })}
                        className={numberInputClass}
                      />
                      <span className="text-xs font-bold text-muted-foreground">
                        %
                      </span>
                    </div>
                    {block.steps.length > 1 && (
                      <Button
                        variant="remove"
                        size="icon-round"
                        type="button"
                        onClick={() =>
                          onChangeBlock(item.key, block.key, {
                            steps: block.steps.filter(
                              (_, i) => i !== stepIndex,
                            ),
                          })
                        }
                        aria-label={t("removeStep")}
                        className="shrink-0 p-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    onChangeBlock(item.key, block.key, {
                      steps: [...block.steps, { reps: "", pct: "" }],
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  {t("addStep")}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
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
                    aria-label={t("sets")}
                    className={numberInputClass}
                  />
                  <span className="text-xs font-bold text-muted-foreground">
                    {t("setsUnit")}
                  </span>
                </div>

                <span className="text-muted-foreground font-bold">×</span>

                <div className="flex items-center gap-1.5">
                  {usesSeconds(block) ? (
                    <DurationField
                      value={block.durationSec}
                      onChange={(durationSec) =>
                        onChangeBlock(item.key, block.key, { durationSec })
                      }
                      label={t("timeGoal")}
                      size="sm"
                    />
                  ) : (
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={block.reps}
                      onChange={(e) =>
                        onChangeBlock(item.key, block.key, {
                          reps: e.target.value,
                        })
                      }
                      aria-label={t(usesRepRange(block) ? "repsMin" : "reps")}
                      className={numberInputClass}
                    />
                  )}
                  {usesRepRange(block) && (
                    <>
                      <span className="text-muted-foreground font-bold">–</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={block.repsMax}
                        onChange={(e) =>
                          onChangeBlock(item.key, block.key, {
                            repsMax: e.target.value,
                          })
                        }
                        placeholder={t("repsMaxPlaceholder")}
                        aria-label={t("repsMax")}
                        className={numberInputClass}
                      />
                    </>
                  )}
                  {!usesSeconds(block) && (
                    <span className="text-xs font-bold text-muted-foreground">
                      reps
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => onAddBlock(item.key)}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          {t("addBlock")}
        </button>
      </div>
    </div>
  );
}
