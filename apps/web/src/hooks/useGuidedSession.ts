import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Exercise, Routine, RoutineItem } from "@/lib/types";
import {
  type ActiveSession,
  type ActiveExtra,
  readActiveSession,
  writeActiveSession,
  clearActiveSession,
} from "@/lib/activeSession";
import { rememberEquipment } from "@/lib/equipmentMemory";
import { notifyError } from "@/lib/notify";

type Phase = "logging" | "done";

export type ItemStatus = "done" | "partial" | "pending" | "skipped";

export interface SessionMapItem {
  index: number;
  item: RoutineItem; // already reflects a replacement (substitute swapped in place)
  status: ItemStatus;
  setsDone: number;
  isCurrent: boolean;
  isExtra: boolean;
  replacedFrom: string | null; // original exercise name when this slot was replaced
}

interface LogSetArgs {
  weightKg: number;
  reps: number;
  opinion?: string;
  equipmentId?: string | null;
  isApproximation?: boolean;
}

export interface LastResult {
  exerciseName: string;
  weightKg: number;
  reps: number;
  setNumber: number;
  suggestedWeight: number | null;
}

export function useGuidedSession() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [phase, setPhase] = useState<Phase>("logging");
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  useEffect(() => {
    const active = readActiveSession();
    if (!active) {
      setLoading(false);
      return;
    }
    setSession(active);
    api
      .get<Routine>(routes.api.routines.get(active.routineId))
      .then((r) => setRoutine(r))
      // Routine gone (deleted / 404): drop the zombie session instead of
      // stranding the user in a loop (see TD-013).
      .catch(() => clearActiveSession())
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: ActiveSession) => {
    setSession(next);
    writeActiveSession(next);
  }, []);

  // Combined sequence: routine items first, then ad-hoc extras.
  const extraItems: RoutineItem[] = (session?.extras ?? []).map((e, i) => ({
    exerciseId: e.exerciseId,
    exercise: e.exercise,
    position: (routine?.items.length ?? 0) + i,
    targetSets: null,
    targetReps: null,
  }));
  const baseItems: RoutineItem[] = [...(routine?.items ?? []), ...extraItems];

  // A replaced slot keeps its position + targets but swaps in the substitute.
  const replacedBy = session?.replacedBy ?? {};
  const items: RoutineItem[] = baseItems.map((it, i) => {
    const sub = replacedBy[i];
    if (!sub) return it;
    return { ...it, exerciseId: sub.exerciseId, exercise: sub.exercise };
  });

  const skipped = session?.skipped ?? {};
  const currentIndex = session?.currentIndex ?? 0;
  const progress = session?.progress ?? {};
  const currentItem: RoutineItem | null = items[currentIndex] ?? null;
  const setsDoneForCurrent = progress[currentIndex] ?? 0;

  const statusFor = (i: number): ItemStatus => {
    if (skipped[i]) return "skipped";
    const done = progress[i] ?? 0;
    const target = items[i]?.targetSets;
    if (target != null && done >= target) return "done";
    if (done > 0) return "partial";
    return "pending";
  };

  // Indices still in play (not skipped), in order — the checklist backbone.
  const liveIndices = items
    .map((_, i) => i)
    .filter((i) => !skipped[i]);

  // "Next machine" = first live item after the current one.
  const nextIndex = liveIndices.find((i) => i > currentIndex) ?? -1;
  const nextItem: RoutineItem | null = nextIndex >= 0 ? items[nextIndex] : null;

  const routineItemCount = routine?.items.length ?? 0;
  const mapItems: SessionMapItem[] = items.map((item, i) => ({
    index: i,
    item,
    status: statusFor(i),
    setsDone: progress[i] ?? 0,
    isCurrent: i === currentIndex,
    isExtra: i >= routineItemCount,
    replacedFrom: replacedBy[i] ? baseItems[i].exercise.name : null,
  }));

  const totalCount = liveIndices.length; // M in "Ejercicio N de M"
  const position = liveIndices.indexOf(currentIndex) + 1; // N (1-based)
  // Completed = every live slot that has a target has met it. Free-set items
  // (no target) never block completion. ponytail: an all-free routine reads
  // "completed" from the start — acceptable per the agreed rule.
  const allDone = !liveIndices.some((i) => {
    const t = items[i]?.targetSets;
    return t != null && (progress[i] ?? 0) < t;
  });

  const logSet = useCallback(
    async ({
      weightKg,
      reps,
      opinion,
      equipmentId,
      isApproximation,
    }: LogSetArgs) => {
      if (!session || !currentItem) return;
      setLogging(true);
      const run = async () => {
        try {
          await api.post(routes.api.workouts.create(), {
            exerciseId: currentItem.exerciseId,
            reps,
            weight: weightKg,
            opinion: opinion ?? "",
            equipmentId: equipmentId ?? null,
            routineId: session.routineId,
            isApproximation: isApproximation ?? false,
          });
          rememberEquipment(currentItem.exerciseId, equipmentId ?? null);

          const setNumber = (progress[currentIndex] ?? 0) + 1;
          const nextProgress = { ...progress, [currentIndex]: setNumber };
          persist({ ...session, progress: nextProgress });

          let suggestedWeight: number | null = null;
          try {
            const rec = await api.get<{ suggestedWeight: number | null }>(
              routes.api.workouts.recommendation(
                currentItem.exerciseId,
                isApproximation ?? false,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                equipmentId ?? null,
              ),
            );
            suggestedWeight = rec.suggestedWeight;
          } catch (e) {
            console.error("Error fetching recommendation:", e);
          }

          setLastResult({
            exerciseName: currentItem.exercise.name,
            weightKg,
            reps,
            setNumber,
            suggestedWeight,
          });
          setPhase("done");
        } catch (e) {
          console.error("Error logging set:", e);
          notifyError("No se pudo registrar la serie", run);
        } finally {
          setLogging(false);
        }
      };
      await run();
    },
    [session, currentItem, progress, currentIndex, persist],
  );

  // Stay on the same exercise and log the next set.
  const continueSet = useCallback(() => {
    setPhase("logging");
  }, []);

  // Advance to the next live exercise in the sequence.
  const goNext = useCallback(() => {
    if (!session || nextIndex < 0) return;
    persist({ ...session, currentIndex: nextIndex });
    setPhase("logging");
  }, [session, nextIndex, persist]);

  // Jump to any exercise from the session map (un-skips it if it was skipped).
  const goToIndex = useCallback(
    (i: number) => {
      if (!session || i < 0 || i >= items.length) return;
      const nextSkipped = { ...session.skipped };
      delete nextSkipped[i];
      persist({ ...session, currentIndex: i, skipped: nextSkipped });
      setPhase("logging");
    },
    [session, items.length, persist],
  );

  // Skip an exercise for today. If it was the current one, move on to the
  // nearest remaining live item.
  const skipItem = useCallback(
    (i: number) => {
      if (!session) return;
      const nextSkipped = { ...session.skipped, [i]: true };
      let nextCurrent = session.currentIndex;
      if (i === session.currentIndex) {
        const all = items.map((_, idx) => idx);
        const target =
          all.find((idx) => idx > i && !nextSkipped[idx]) ??
          all.find((idx) => !nextSkipped[idx]);
        if (target != null) nextCurrent = target;
      }
      persist({ ...session, skipped: nextSkipped, currentIndex: nextCurrent });
      setPhase("logging");
    },
    [session, items, persist],
  );

  // Replace a slot with another exercise (e.g. machine occupied). The slot
  // keeps its targets; its set count resets since it's now a new movement.
  const replaceItem = useCallback(
    (i: number, exercise: Exercise) => {
      if (!session) return;
      const sub: ActiveExtra = {
        exerciseId: exercise.id,
        exercise: { id: exercise.id, name: exercise.name },
      };
      const nextSkipped = { ...session.skipped };
      delete nextSkipped[i];
      const nextProgress = { ...session.progress };
      delete nextProgress[i];
      persist({
        ...session,
        replacedBy: { ...session.replacedBy, [i]: sub },
        skipped: nextSkipped,
        progress: nextProgress,
        currentIndex: i,
      });
      setPhase("logging");
    },
    [session, persist],
  );

  // Append an ad-hoc exercise and jump to it.
  const addExercise = useCallback(
    (exercise: Exercise) => {
      if (!session) return;
      const newIndex = items.length;
      persist({
        ...session,
        extras: [
          ...session.extras,
          {
            exerciseId: exercise.id,
            exercise: {
              id: exercise.id,
              name: exercise.name,
            },
          },
        ],
        currentIndex: newIndex,
      });
      setPhase("logging");
    },
    [session, items.length, persist],
  );

  const finish = useCallback(() => {
    clearActiveSession();
    router.push(routes.home());
  }, [router]);

  return {
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
    lastResult,
    mapItems,
    position,
    totalCount,
    allDone,
    logSet,
    continueSet,
    goNext,
    goToIndex,
    skipItem,
    replaceItem,
    addExercise,
    finish,
  };
}
