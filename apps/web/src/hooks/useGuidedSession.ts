import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { plannedSetCount } from "@/lib/blocks";
import type { LogSetInput } from "@/components/train/SetForm";
import { notifyError } from "@/lib/notify";
import { setMetrics } from "@/lib/setDisplay";

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

export interface SaveFlash {
  title: string;
  detail: string;
  saved: boolean;
  next: string | null;
  leaving: boolean;
}

const FLASH_MS = 1000;
const FADE_MS = 250;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const describeSet = ({ weightKg, reps, durationSec }: LogSetInput) =>
  setMetrics({ weight: weightKg, reps, durationSec })
    .map((m) => `${m.value} ${m.unit}`)
    .join(" × ");

async function postSet(
  exerciseId: string,
  routineId: string,
  {
    weightKg,
    reps,
    durationSec,
    equipmentId,
    setType = "WORKING",
    step,
  }: LogSetInput,
) {
  await api.post(routes.api.workouts.create(), {
    exerciseId,
    reps: reps ?? null,
    weight: weightKg ?? null,
    durationSec: durationSec ?? null,
    equipmentId: equipmentId ?? null,
    routineId,
    setType,
    step: step ?? null,
  });
  rememberEquipment(exerciseId, equipmentId ?? null);
}

export function useGuidedSession() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(
    readActiveSession,
  );
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(session !== null);
  const [logging, setLogging] = useState(false);
  const [phase, setPhase] = useState<Phase>("logging");
  const [flash, setFlash] = useState<SaveFlash | null>(null);
  const savingRef = useRef(false);

  const routineId = session?.routineId;
  useEffect(() => {
    if (!routineId) return;
    api
      .get<Routine>(routes.api.routines.get(routineId))
      .then((r) => setRoutine(r))
      // Routine gone (deleted / 404): drop the zombie session instead of
      // stranding the user in a loop (see TD-013).
      .catch(() => clearActiveSession())
      .finally(() => setLoading(false));
  }, [routineId]);

  const persist = useCallback((next: ActiveSession) => {
    setSession(next);
    writeActiveSession(next);
  }, []);

  // Combined sequence: routine items first, then ad-hoc extras.
  const extraItems: RoutineItem[] = (session?.extras ?? []).map((e, i) => ({
    exerciseId: e.exerciseId,
    exercise: e.exercise,
    position: (routine?.items.length ?? 0) + i,
    blocks: [],
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
  const progress = useMemo(() => session?.progress ?? {}, [session]);
  const currentItem: RoutineItem | null = items[currentIndex] ?? null;
  const setsDoneForCurrent = progress[currentIndex] ?? 0;

  const statusFor = (i: number): ItemStatus => {
    if (skipped[i]) return "skipped";
    const done = progress[i] ?? 0;
    const target = plannedSetCount(items[i]?.blocks ?? []);
    if (target > 0 && done >= target) return "done";
    if (done > 0) return "partial";
    return "pending";
  };

  // Indices still in play (not skipped), in order — the checklist backbone.
  const liveIndices = items
    .map((_, i) => i)
    .filter((i) => !skipped[i]);

  // "Next machine" = first unfinished live item after the current one,
  // wrapping to the start. Free items count as finished after one set.
  const isUnfinished = (i: number) => {
    const target = plannedSetCount(items[i]?.blocks ?? []);
    return (progress[i] ?? 0) < Math.max(target, 1);
  };
  const nextIndex =
    [
      ...liveIndices.filter((i) => i > currentIndex),
      ...liveIndices.filter((i) => i < currentIndex),
    ].find(isUnfinished) ?? -1;
  const remainingCount = liveIndices.filter(isUnfinished).length;
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
    return (progress[i] ?? 0) < plannedSetCount(items[i]?.blocks ?? []);
  });

  // After saving sets on the current item: stay while it has sets left (a
  // free item stays while there is somewhere to go), else move to the next
  // pending item, else the routine is complete.
  const settle = useCallback(
    (added: number) => {
      if (!session || !currentItem) return null;
      const done = (progress[currentIndex] ?? 0) + added;
      const target = plannedSetCount(currentItem.blocks);
      const stay = target > 0 ? done < target : nextIndex >= 0;
      const advance = !stay && nextIndex >= 0;
      persist({
        ...session,
        progress: { ...progress, [currentIndex]: done },
        lastSetAt: new Date().toISOString(),
        ...(advance ? { currentIndex: nextIndex } : {}),
      });
      if (!stay && !advance) setPhase("done");
      return advance ? items[nextIndex].exercise.name : null;
    },
    [session, currentItem, progress, currentIndex, nextIndex, items, persist],
  );

  // Covers the screen from the tap until the save lands and its check has
  // been on screen long enough to read, so a second tap cannot log twice.
  const saveWithFlash = useCallback(
    async (title: string, detail: string, save: () => Promise<number>) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setLogging(true);
      setFlash({ title, detail, saved: false, next: null, leaving: false });
      try {
        const next = settle(await save());
        setFlash((f) => f && { ...f, saved: true, next });
        await wait(FLASH_MS);
        setFlash((f) => f && { ...f, leaving: true });
        await wait(FADE_MS);
      } finally {
        savingRef.current = false;
        setFlash(null);
        setLogging(false);
      }
    },
    [settle],
  );

  const logSet = useCallback(
    async (input: LogSetInput) => {
      if (!session || !currentItem) return;
      const setNumber = (progress[currentIndex] ?? 0) + 1;
      const run = async () => {
        try {
          await saveWithFlash(
            `Serie ${setNumber}`,
            `${currentItem.exercise.name} · ${describeSet(input)}`,
            async () => {
              await postSet(currentItem.exerciseId, session.routineId, input);
              return 1;
            },
          );
        } catch (e) {
          console.error("Error logging set:", e);
          notifyError("No se pudo registrar la serie", run);
        }
      };
      await run();
    },
    [session, currentItem, progress, currentIndex, saveWithFlash],
  );

  const logRamp = useCallback(
    async (sets: LogSetInput[]) => {
      if (!session || !currentItem) return;
      const before = progress[currentIndex] ?? 0;
      let saved = 0;
      try {
        await saveWithFlash(
          "Rampa",
          `${currentItem.exercise.name} · ${sets.length} series`,
          async () => {
            for (const set of sets) {
              await postSet(currentItem.exerciseId, session.routineId, set);
              saved += 1;
            }
            return saved;
          },
        );
      } catch (e) {
        console.error("Error logging ramp:", e);
        if (saved > 0)
          persist({
            ...session,
            progress: { ...progress, [currentIndex]: before + saved },
            lastSetAt: new Date().toISOString(),
          });
        notifyError("No se pudo registrar la rampa");
      }
    },
    [session, currentItem, progress, currentIndex, saveWithFlash, persist],
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
        exercise: {
          id: exercise.id,
          name: exercise.name,
        },
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
    flash,
    mapItems,
    position,
    totalCount,
    remainingCount,
    allDone,
    logSet,
    logRamp,
    continueSet,
    goNext,
    goToIndex,
    skipItem,
    replaceItem,
    finish,
  };
}
