"use client";

import { useState } from "react";
import Link from "next/link";
import { useGuidedSession } from "@/hooks/useGuidedSession";
import { useEquipment } from "@/hooks/useEquipment";
import { routes } from "@/lib/routes";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { SetLogger } from "@/components/train/SetLogger";
import { SetDoneScreen } from "@/components/train/SetDoneScreen";
import { AddExerciseSheet } from "@/components/train/AddExerciseSheet";
import { SessionMap } from "@/components/train/SessionMap";
import { Loader2, ClipboardList, Dumbbell, ListChecks } from "lucide-react";

export default function TrainPage() {
  const {
    loading,
    logging,
    phase,
    routine,
    items,
    currentItem,
    nextItem,
    setsDoneForCurrent,
    lastResult,
    mapItems,
    position,
    totalCount,
    logSet,
    continueSet,
    goNext,
    goToIndex,
    skipItem,
    replaceItem,
    addExercise,
    finish,
  } = useGuidedSession();

  const { equipment } = useEquipment();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  if (loading) {
    return (
      <PageShell>
        <AppHeader leftAction={<BackAction href={routes.home()} />} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!routine || items.length === 0 || !currentItem) {
    return (
      <PageShell>
        <AppHeader leftAction={<BackAction href={routes.home()} />} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center text-muted-foreground">
          <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-bold text-foreground">No hay una rutina activa</p>
          <p className="text-sm opacity-70 mb-6">
            Empieza una rutina para entrenar guiado.
          </p>
          <Link
            href={routes.routines()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
          >
            Ver mis rutinas
          </Link>
        </main>
      </PageShell>
    );
  }

  const target = currentItem.targetSets;
  const hasPendingSets = target != null && setsDoneForCurrent < target;

  // What the lifter should set up next, shown during rest on the done screen.
  const nextUp = hasPendingSets
    ? {
        label: "Sigue en la misma máquina",
        name: currentItem.exercise.name,
        detail: `Serie ${setsDoneForCurrent + 1}${
          currentItem.targetReps
            ? ` · objetivo ${currentItem.targetReps} reps`
            : ""
        }`,
      }
    : nextItem
      ? {
          label: "Prepara la siguiente máquina",
          name: nextItem.exercise.name,
          detail: nextItem.targetSets
            ? `${nextItem.targetSets} × ${nextItem.targetReps ?? "—"}`
            : "",
        }
      : null;

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title={routine.name}
        rightAction={
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
            title="Mapa de la sesión"
          >
            <ListChecks className="w-6 h-6" />
            <span className="text-xs font-bold tabular-nums">
              {position}/{totalCount}
            </span>
          </button>
        }
      />

      {phase === "done" && lastResult ? (
        <SetDoneScreen
          result={lastResult}
          hasPendingSets={hasPendingSets}
          nextItem={nextItem}
          nextUp={nextUp}
          onContinueSet={continueSet}
          onNext={goNext}
          onAddExercise={() => setPickerOpen(true)}
          onFinish={finish}
        />
      ) : (
        <main className="flex-1 flex flex-col justify-center px-6 py-6 relative z-10 animate-fade-in-up">
          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Current exercise header */}
            <div className="flex items-center gap-4 rounded-2xl border-2 border-primary bg-card p-4 shadow-lg shadow-primary/5">
              <div className="shrink-0 p-3 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-primary uppercase tracking-wide">
                  Serie {setsDoneForCurrent + 1}
                </p>
                <p className="font-bold text-lg text-foreground leading-tight truncate">
                  {currentItem.exercise.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {target
                    ? `Meta: ${target} × ${currentItem.targetReps ?? "—"}`
                    : "Series libres"}
                </p>
              </div>
            </div>

            <SetLogger
              key={`${currentItem.exerciseId}-${setsDoneForCurrent}`}
              item={currentItem}
              equipment={equipment}
              logging={logging}
              onLog={logSet}
            />
          </div>
        </main>
      )}

      {pickerOpen && (
        <AddExerciseSheet
          onPick={(exercise) => {
            setPickerOpen(false);
            addExercise(exercise);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {mapOpen && (
        <SessionMap
          items={mapItems}
          position={position}
          totalCount={totalCount}
          onGoTo={(i) => {
            goToIndex(i);
            setMapOpen(false);
          }}
          onSkip={skipItem}
          onReplace={replaceItem}
          onClose={() => setMapOpen(false)}
        />
      )}
    </PageShell>
  );
}
