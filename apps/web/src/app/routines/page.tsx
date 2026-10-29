"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRoutines } from "@/hooks/useRoutines";
import { usePrograms } from "@/hooks/usePrograms";
import { routes } from "@/lib/routes";
import type { Routine } from "@/lib/types";
import { readActiveSession, startSession } from "@/lib/activeSession";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { DeleteRoutineDialog } from "@/components/routines/DeleteRoutineDialog";
import {
  Plus,
  ClipboardList,
  ChevronDown,
  Compass,
  Layers,
} from "lucide-react";
import { buttonVariants } from "@/components/base/button";
import { heading } from "@/components/base/heading";
import { Spinner } from "@/components/base/spinner";
import { cn } from "@/lib/utils";
import { surfaceClass } from "@/components/base/surface";

export default function RoutinesPage() {
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    router.prefetch(routes.train());
  }, [router]);
  const {
    routines,
    loading: loadingRoutines,
    deletingRoutine,
    setDeletingRoutine,
    confirmDelete,
    actionLoading,
  } = useRoutines();
  const {
    programs,
    activeProgramId,
    nextRoutineId,
    loading: loadingPrograms,
  } = usePrograms();
  const [showOthers, setShowOthers] = useState(false);
  const loading = loadingRoutines || loadingPrograms;

  const byId = new Map(routines.map((r) => [r.id, r]));
  const inOrder = (list: { id: string }[]) =>
    list.flatMap((r) => byId.get(r.id) ?? []);
  const activeProgram = programs.find((p) => p.id === activeProgramId);
  const activeRoutines = activeProgram ? inOrder(activeProgram.routines) : [];
  const otherGroups = [
    ...programs
      .filter((p) => p.id !== activeProgramId)
      .map((p) => ({
        key: p.id,
        title: p.name,
        routines: inOrder(p.routines),
      })),
    {
      key: "loose",
      title: t("routines.noProgram"),
      routines: routines.filter((r) => !r.programId),
    },
  ].filter((group) => group.routines.length > 0);

  const renderCards = (list: Routine[]) =>
    list.map((routine, index) => (
      <RoutineCard
        key={routine.id}
        routine={routine}
        index={index}
        isNext={routine.id === nextRoutineId}
        onStart={handleStart}
        onDelete={setDeletingRoutine}
      />
    ));

  const handleStart = (routine: Routine) => {
    const active = readActiveSession();
    if (
      active &&
      active.routineId !== routine.id &&
      !window.confirm(
        t("routines.replaceActive", {
          active: active.routineName,
          routine: routine.name,
        }),
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
        title={t("routines.title")}
        rightAction={
          <Link
            href={routes.routineNew()}
            className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
            title={t("routines.new")}
            aria-label={t("routines.new")}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Link>
        }
      />

      <main className="flex-1 px-6 pt-8 pb-nav relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-10 text-primary" />
            </div>
          ) : routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
              <p
                className={heading({
                  size: "sm",
                  className: "text-foreground",
                })}
              >
                {t("routines.empty")}
              </p>
              <p className="text-sm opacity-70 mb-6">
                {t("routines.emptyHint")}
              </p>
              <Link
                href={routes.routineNew()}
                className={buttonVariants({ size: "lg" })}
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                {t("routines.new")}
              </Link>
            </div>
          ) : activeRoutines.length === 0 ? (
            renderCards(routines)
          ) : (
            <>
              <p className="kicker text-primary text-3xs">
                {activeProgram?.name}
              </p>
              {renderCards(activeRoutines)}

              {otherGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowOthers((prev) => !prev)}
                  aria-expanded={showOthers}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("routines.otherPrograms")}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      showOthers ? "rotate-180" : "",
                    )}
                  />
                </button>
              )}

              {showOthers &&
                otherGroups.map((group) => (
                  <div key={group.key} className="space-y-3 pt-2">
                    <p className="kicker text-muted-foreground text-3xs">
                      {group.title}
                    </p>
                    {renderCards(group.routines)}
                  </div>
                ))}
            </>
          )}

          {!loading && (
            <div className="grid grid-cols-2 gap-3 pt-6">
              <Link
                href={routes.programs()}
                className={cn(
                  surfaceClass,
                  "flex flex-col gap-2 min-h-[92px] p-4 hover:border-border active:scale-[0.98] transition-all",
                )}
              >
                <Layers
                  className="w-6 h-6 text-muted-foreground"
                  strokeWidth={2.5}
                />
                <span className="font-bold text-foreground leading-tight">
                  {t("routines.programsTile")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("routines.programsTileHint")}
                </span>
              </Link>
              <Link
                href={routes.explore("routines")}
                className={cn(
                  surfaceClass,
                  "flex flex-col gap-2 min-h-[92px] p-4 hover:border-border active:scale-[0.98] transition-all",
                )}
              >
                <Compass
                  className="w-6 h-6 text-muted-foreground"
                  strokeWidth={2.5}
                />
                <span className="font-bold text-foreground leading-tight">
                  {t("common.explore")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("routines.exploreTileHint")}
                </span>
              </Link>
            </div>
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

      <BottomNav />
    </PageShell>
  );
}
