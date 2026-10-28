"use client";

import { useState } from "react";
import Link from "next/link";
import { useGuidedSession } from "@/hooks/useGuidedSession";
import { useEquipment } from "@/hooks/useEquipment";
import { useRestSeconds } from "@/hooks/useRestSeconds";
import { formatClock } from "@/lib/setDisplay";
import { routes } from "@/lib/routes";
import { formatBlocks, plannedSetCount, setPlan } from "@/lib/blocks";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { SetLogger } from "@/components/train/SetLogger";
import { SetDoneScreen } from "@/components/train/SetDoneScreen";
import { SaveOverlay } from "@/components/train/SaveOverlay";
import { UnsavedSetsDialog } from "@/components/train/UnsavedSetsDialog";
import { SessionMap } from "@/components/train/SessionMap";
import { ExerciseProgress } from "@/components/train/ExerciseProgress";
import { TikTokButton } from "@/components/exercises/TikTokButton";
import { ClipboardList, ListChecks, Timer, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/base/button";
import { heading } from "@/components/base/heading";
import { Spinner } from "@/components/base/spinner";

export default function TrainPage() {
  const {
    loading,
    logging,
    phase,
    routine,
    session,
    items,
    currentIndex,
    currentItem,
    nextItem,
    setsDoneForCurrent,
    flash,
    mapItems,
    position,
    totalCount,
    remainingCount,
    logSet,
    logRamp,
    continueSet,
    goNext,
    goToIndex,
    skipItem,
    replaceItem,
    finish,
    unsaved,
    retrying,
    retryUnsaved,
    discardUnsaved,
    closeUnsaved,
  } = useGuidedSession();

  const { equipment } = useEquipment();
  const [mapOpen, setMapOpen] = useState(false);
  const restSec = useRestSeconds(session?.lastSetAt);

  if (loading) {
    return (
      <PageShell>
        <AppHeader leftAction={<BackAction href={routes.home()} />} />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="size-10 text-primary" />
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
          <p className={heading({ size: "sm", className: "text-foreground" })}>
            No hay una rutina activa
          </p>
          <p className="text-sm opacity-70 mb-6">
            Empieza una rutina para entrenar guiado.
          </p>
          <Link
            href={routes.routines()}
            className={buttonVariants({ size: "lg" })}
          >
            Ver mis rutinas
          </Link>
        </main>
      </PageShell>
    );
  }

  const currentTarget = formatBlocks(currentItem.blocks);
  const currentPlan = setPlan(currentItem.blocks, setsDoneForCurrent);
  const freeWithNext =
    plannedSetCount(currentItem.blocks) === 0 &&
    setsDoneForCurrent > 0 &&
    nextItem != null;

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
            aria-label={`Mapa de la sesión, ${position}/${totalCount}`}
          >
            <ListChecks className="w-6 h-6" />
            <span className="text-xs font-bold tabular-nums">
              {position}/{totalCount}
            </span>
          </button>
        }
      />

      {phase === "done" ? (
        <SetDoneScreen onExtraSet={continueSet} onFinish={finish} />
      ) : (
        <main className="flex-1 flex flex-col justify-center px-6 py-6 relative z-10 animate-fade-in-up">
          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Current exercise header */}
            <div className="relative rounded-2xl border-2 border-primary bg-card p-5 shadow-lg shadow-primary/5">
              {restSec != null && (
                <div
                  className="absolute -top-4 left-4 flex items-center gap-1.5 rounded-full border-2 border-input bg-card pl-2.5 pr-3 py-1 shadow-lg text-foreground animate-pop"
                  aria-label="Tiempo de descanso"
                >
                  <Timer className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <span className="font-display font-bold text-lg tabular-nums leading-none">
                    {formatClock(restSec)}
                  </span>
                </div>
              )}
              <p className="kicker text-4xs text-primary">
                {currentPlan.setType === "RAMP"
                  ? "Rampa"
                  : `Serie ${setsDoneForCurrent + 1}`}
                {currentTarget ? ` · Meta ${currentTarget}` : " · Libre"}
              </p>
              <p
                className={heading({
                  size: "md",
                  className: "text-foreground leading-[0.95] mt-2 text-balance",
                })}
              >
                {currentItem.exercise.name}
              </p>
              {session && currentPlan.setType === "WORKING" && (
                <ExerciseProgress
                  key={currentItem.exerciseId}
                  exerciseId={currentItem.exerciseId}
                  routineId={session.routineId}
                  setsDone={setsDoneForCurrent}
                />
              )}
              <TikTokButton
                query={currentItem.exercise.name}
                className="absolute -bottom-4 right-4"
              />
            </div>

            <SetLogger
              key={`${currentItem.exerciseId}-${setsDoneForCurrent}`}
              item={currentItem}
              setIndex={setsDoneForCurrent}
              replaced={mapItems[currentIndex]?.replacedFrom != null}
              equipment={equipment}
              logging={logging}
              onLog={logSet}
              onLogRamp={logRamp}
            />

            {freeWithNext && (
              <button
                type="button"
                onClick={goNext}
                className="w-full py-3 text-muted-foreground hover:text-foreground font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                Siguiente: {nextItem.exercise.name}
              </button>
            )}
          </div>
        </main>
      )}

      {flash && <SaveOverlay flash={flash} />}

      <UnsavedSetsDialog
        sets={unsaved}
        retrying={retrying}
        onRetry={retryUnsaved}
        onDiscard={discardUnsaved}
        onClose={closeUnsaved}
      />

      {mapOpen && (
        <SessionMap
          items={mapItems}
          position={position}
          totalCount={totalCount}
          remainingCount={remainingCount}
          onGoTo={(i) => {
            goToIndex(i);
            setMapOpen(false);
          }}
          onSkip={skipItem}
          onReplace={replaceItem}
          onFinish={finish}
          onClose={() => setMapOpen(false)}
        />
      )}
    </PageShell>
  );
}
