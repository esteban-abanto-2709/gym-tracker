import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Exercise, Routine, RoutineItem } from "@/lib/types";
import {
  type ActiveSession,
  readActiveSession,
  writeActiveSession,
  clearActiveSession,
} from "@/lib/activeSession";

type Phase = "logging" | "done";

interface LogSetArgs {
  weightKg: number;
  reps: number;
  opinion?: string;
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
      .catch((e) => console.error("Error loading routine:", e))
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
  const items: RoutineItem[] = [...(routine?.items ?? []), ...extraItems];

  const currentIndex = session?.currentIndex ?? 0;
  const progress = session?.progress ?? {};
  const currentItem: RoutineItem | null = items[currentIndex] ?? null;
  const nextItem: RoutineItem | null = items[currentIndex + 1] ?? null;
  const setsDoneForCurrent = progress[currentIndex] ?? 0;

  const logSet = useCallback(
    async ({ weightKg, reps, opinion, isApproximation }: LogSetArgs) => {
      if (!session || !currentItem) return;
      setLogging(true);
      try {
        await api.post(routes.api.workouts.create(), {
          exerciseId: currentItem.exerciseId,
          reps,
          weight: weightKg,
          opinion: opinion ?? "",
          routineId: session.routineId,
          isApproximation: isApproximation ?? false,
        });

        const setNumber = (progress[currentIndex] ?? 0) + 1;
        const nextProgress = { ...progress, [currentIndex]: setNumber };
        persist({ ...session, progress: nextProgress });

        let suggestedWeight: number | null = null;
        try {
          const rec = await api.get<{ suggestedWeight: number | null }>(
            routes.api.workouts.recommendation(
              currentItem.exerciseId,
              isApproximation ?? false,
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
      } finally {
        setLogging(false);
      }
    },
    [session, currentItem, progress, currentIndex, persist],
  );

  // Stay on the same exercise and log the next set.
  const continueSet = useCallback(() => {
    setPhase("logging");
  }, []);

  // Advance to the next exercise in the sequence.
  const goNext = useCallback(() => {
    if (!session || currentIndex + 1 >= items.length) return;
    persist({ ...session, currentIndex: currentIndex + 1 });
    setPhase("logging");
  }, [session, currentIndex, items.length, persist]);

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
              equipment: exercise.equipment,
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
    logSet,
    continueSet,
    goNext,
    addExercise,
    finish,
  };
}
