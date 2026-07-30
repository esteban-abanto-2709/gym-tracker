"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import type { SessionMapItem } from "@/hooks/useGuidedSession";
import { AddExerciseSheet } from "@/components/train/AddExerciseSheet";
import {
  X,
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

// Punto de estado (estilo del mock): rojo = actual, lima = hecho, ámbar = a
// medias, tenue = pendiente, borde = saltado.
function StatusDot({ item }: { item: SessionMapItem }) {
  const color =
    item.status === "skipped"
      ? "bg-border"
      : item.isCurrent
        ? "bg-primary"
        : item.status === "done"
          ? "bg-success"
          : item.status === "partial"
            ? "bg-amber-400"
            : "bg-muted-foreground/30";
  return <span className={`block w-3 h-3 rounded-full ${color}`} />;
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
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
      />

      {/* Bottom sheet */}
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[80%] overflow-y-auto animate-sheet-up px-5 pt-3 pb-8">
        <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold uppercase text-2xl text-foreground tracking-tight">
              Mapa de la sesión
            </h2>
            <p className="kicker text-[0.6rem] text-muted-foreground mt-1">
              Ejercicio {position} de {totalCount}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-secondary text-foreground hover:text-primary transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          {items.map((mi) => {
            const isSkipped = mi.status === "skipped";
            return (
              <div
                key={mi.index}
                className={`rounded-2xl border-2 transition-all ${
                  mi.isCurrent
                    ? "border-primary bg-secondary"
                    : "border-input bg-transparent"
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => onGoTo(mi.index)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left active:scale-[0.99] transition-transform"
                  >
                    <span className="shrink-0">
                      <StatusDot item={mi} />
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
    </>
  );
}
