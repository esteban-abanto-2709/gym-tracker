"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoutines } from "@/hooks/useRoutines";
import { routes } from "@/lib/routes";
import type { Routine } from "@/lib/types";
import { readActiveSession, startSession } from "@/lib/activeSession";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { DeleteRoutineDialog } from "@/components/routines/DeleteRoutineDialog";
import { Loader2, Plus, ClipboardList } from "lucide-react";

export default function RoutinesPage() {
  const router = useRouter();
  const {
    routines,
    loading,
    deletingRoutine,
    setDeletingRoutine,
    confirmDelete,
    actionLoading,
  } = useRoutines();

  const handleStart = (routine: Routine) => {
    const active = readActiveSession();
    if (
      active &&
      active.routineId !== routine.id &&
      !window.confirm(
        `Tienes "${active.routineName}" en curso. ¿Empezar "${routine.name}" y descartarla?`,
      )
    ) {
      return;
    }
    startSession(routine);
    router.push(routes.train());
  };

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title="Rutinas"
        rightAction={
          <Link
            href={routes.routineNew()}
            className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
            title="Nueva rutina"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Link>
        }
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-display font-bold uppercase text-foreground text-2xl tracking-tight">
                Aún no tienes rutinas
              </p>
              <p className="text-sm opacity-70 mb-6">
                Arma tu primera rutina con calma.
              </p>
              <Link
                href={routes.routineNew()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-lg shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Nueva Rutina
              </Link>
            </div>
          ) : (
            routines.map((routine, index) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                index={index}
                onStart={handleStart}
                onDelete={setDeletingRoutine}
              />
            ))
          )}
        </div>
      </main>

      <DeleteRoutineDialog
        open={deletingRoutine !== null}
        onOpenChange={(open) => !open && setDeletingRoutine(null)}
        loading={actionLoading}
        routineName={deletingRoutine?.name}
        onConfirm={confirmDelete}
      />
    </PageShell>
  );
}
