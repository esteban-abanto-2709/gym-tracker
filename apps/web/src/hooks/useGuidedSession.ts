import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Routine, RoutineItem } from "@/lib/types";
import {
  type ActiveSession,
  readActiveSession,
  writeActiveSession,
  clearActiveSession,
} from "@/lib/activeSession";

function isItemComplete(item: RoutineItem, done: number): boolean {
  return item.targetSets ? done >= item.targetSets : done > 0;
}

function firstIncompleteIndex(
  items: RoutineItem[],
  progress: Record<number, number>,
): number {
  for (let i = 0; i < items.length; i++) {
    if (!isItemComplete(items[i], progress[i] ?? 0)) return i;
  }
  return -1;
}

interface LogSetArgs {
  weightKg: number;
  reps: number;
  opinion?: string;
}

export function useGuidedSession() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

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
      .catch((e) => console.error("Error loading routine:", e))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: ActiveSession) => {
    setSession(next);
    writeActiveSession(next);
  }, []);

  const items = routine?.items ?? [];
  const currentIndex = session?.currentIndex ?? 0;
  const progress = session?.progress ?? {};
  const currentItem: RoutineItem | null = items[currentIndex] ?? null;

  const logSet = useCallback(
    async ({ weightKg, reps, opinion }: LogSetArgs) => {
      if (!session || !currentItem) return;
      setLogging(true);
      try {
        await api.post(routes.api.workouts.create(), {
          exerciseId: currentItem.exerciseId,
          reps,
          weight: weightKg,
          opinion: opinion ?? "",
          routineId: session.routineId,
        });

        const done = (progress[currentIndex] ?? 0) + 1;
        const nextProgress = { ...progress, [currentIndex]: done };

        let nextIndex = currentIndex;
        if (currentItem.targetSets && done >= currentItem.targetSets) {
          const ni = firstIncompleteIndex(items, nextProgress);
          if (ni !== -1) nextIndex = ni;
        }

        persist({ ...session, progress: nextProgress, currentIndex: nextIndex });
      } catch (e) {
        console.error("Error logging set:", e);
      } finally {
        setLogging(false);
      }
    },
    [session, currentItem, progress, currentIndex, items, persist],
  );

  const goTo = useCallback(
    (index: number) => {
      if (!session) return;
      persist({ ...session, currentIndex: index });
    },
    [session, persist],
  );

  const skip = useCallback(() => {
    if (!session) return;
    const next = Math.min(currentIndex + 1, Math.max(items.length - 1, 0));
    persist({ ...session, currentIndex: next });
  }, [session, currentIndex, items.length, persist]);

  const finish = useCallback(() => {
    clearActiveSession();
    router.push(routes.home());
  }, [router]);

  const completedCount = items.filter((item, i) =>
    isItemComplete(item, progress[i] ?? 0),
  ).length;

  return {
    loading,
    logging,
    routine,
    session,
    items,
    currentIndex,
    currentItem,
    progress,
    completedCount,
    isItemComplete,
    logSet,
    goTo,
    skip,
    finish,
  };
}
