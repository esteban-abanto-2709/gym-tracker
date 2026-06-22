"use client";

import Link from "next/link";
import { useGuidedSession } from "@/hooks/useGuidedSession";
import { routes } from "@/lib/routes";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { GuidedExerciseRow } from "@/components/train/GuidedExerciseRow";
import { SetLogger } from "@/components/train/SetLogger";
import { Loader2, ClipboardList, SkipForward } from "lucide-react";

export default function TrainPage() {
  const {
    loading,
    logging,
    routine,
    items,
    currentIndex,
    progress,
    completedCount,
    isItemComplete,
    logSet,
    goTo,
    skip,
    finish,
  } = useGuidedSession();

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

  if (!routine || items.length === 0) {
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

  const total = items.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleFinish = () => {
    if (
      completedCount < total &&
      !window.confirm("Aún no terminas todos los ejercicios. ¿Terminar igual?")
    ) {
      return;
    }
    finish();
  };

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title={routine.name}
        rightAction={
          <button
            type="button"
            onClick={handleFinish}
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            Terminar
          </button>
        }
      />

      <main className="flex-1 px-6 py-6 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-4">
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>
                {completedCount} de {total} ejercicios
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Exercise list */}
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const done = progress[index] ?? 0;
              const isCurrent = index === currentIndex;
              return (
                <GuidedExerciseRow
                  key={`${item.exerciseId}-${index}`}
                  item={item}
                  index={index}
                  done={done}
                  isCurrent={isCurrent}
                  isComplete={isItemComplete(item, done)}
                  onSelect={goTo}
                >
                  <SetLogger item={item} logging={logging} onLog={logSet} />
                  {total > 1 && (
                    <button
                      type="button"
                      onClick={skip}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <SkipForward className="w-4 h-4" />
                      Saltar ejercicio
                    </button>
                  )}
                </GuidedExerciseRow>
              );
            })}
          </div>
        </div>
      </main>
    </PageShell>
  );
}
