"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import type { SessionMapItem } from "@/hooks/useGuidedSession";
import { AddExerciseSheet } from "@/components/train/AddExerciseSheet";
import {
  X,
  Check,
  Play,
  Circle,
  MoreVertical,
  SkipForward,
  Repeat,
  RotateCcw,
} from "lucide-react";

interface SessionMapProps {
  items: SessionMapItem[];
  position: number;
  totalCount: number;
  onGoTo: (index: number) => void;
  onSkip: (index: number) => void;
  onReplace: (index: number, exercise: Exercise) => void;
  onClose: () => void;
}

function StatusIcon({ item }: { item: SessionMapItem }) {
  if (item.status === "skipped")
    return <SkipForward className="w-5 h-5 text-muted-foreground/60" />;
  if (item.status === "done")
    return <Check className="w-5 h-5 text-primary" strokeWidth={3} />;
  if (item.isCurrent || item.status === "partial")
    return <Play className="w-5 h-5 text-primary" strokeWidth={3} />;
  return <Circle className="w-5 h-5 text-muted-foreground/40" />;
}

function detailText(item: SessionMapItem): string {
  const target = item.item.targetSets;
  if (item.status === "skipped") return "Saltado";
  if (target != null) return `${item.setsDone}/${target} series`;
  if (item.setsDone > 0)
    return `${item.setsDone} ${item.setsDone === 1 ? "serie" : "series"}`;
  return "Series libres";
}

export function SessionMap({
  items,
  position,
  totalCount,
  onGoTo,
  onSkip,
  onReplace,
  onClose,
}: SessionMapProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Mapa de la sesión</h2>
          <p className="text-xs text-muted-foreground">
            Ejercicio {position} de {totalCount}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-3">
          {items.map((mi) => {
            const isSkipped = mi.status === "skipped";
            return (
              <div
                key={mi.index}
                className={`rounded-2xl border-2 bg-card transition-all ${
                  mi.isCurrent
                    ? "border-primary shadow-lg shadow-primary/5"
                    : "border-input"
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => onGoTo(mi.index)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="shrink-0">
                      <StatusIcon item={mi} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-bold leading-tight truncate ${
                          isSkipped
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {mi.item.exercise.name}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {detailText(mi)}
                        {mi.replacedFrom && (
                          <span className="text-primary">
                            {" · ↔ "}
                            {mi.replacedFrom}
                          </span>
                        )}
                        {mi.isExtra && !mi.replacedFrom && (
                          <span className="text-primary">{" · añadido"}</span>
                        )}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMenuIndex(menuIndex === mi.index ? null : mi.index)
                    }
                    className="shrink-0 p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Opciones"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {menuIndex === mi.index && (
                  <div className="flex gap-2 px-4 pb-4 animate-fade-in">
                    {isSkipped ? (
                      <button
                        type="button"
                        onClick={() => {
                          onGoTo(mi.index);
                          setMenuIndex(null);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-input text-sm font-bold text-foreground active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSkip(mi.index);
                          setMenuIndex(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-input text-sm font-bold text-foreground active:scale-95 transition-all"
                      >
                        <SkipForward className="w-4 h-4" />
                        Saltar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingIndex(mi.index);
                        setMenuIndex(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-input text-sm font-bold text-foreground active:scale-95 transition-all"
                    >
                      <Repeat className="w-4 h-4" />
                      Reemplazar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {replacingIndex !== null && (
        <AddExerciseSheet
          onPick={(exercise) => {
            onReplace(replacingIndex, exercise);
            setReplacingIndex(null);
            onClose();
          }}
          onClose={() => setReplacingIndex(null)}
        />
      )}
    </div>
  );
}
