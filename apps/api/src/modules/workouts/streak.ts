import { toLocalDateString } from '@/common/timezone.util';

export type StreakSet = {
  weight: number | null;
  reps: number | null;
  durationSec?: number | null;
  routineId: string | null;
  equipmentId: string | null;
  equipment: { name: string } | null;
  createdAt: Date;
};

export type StreakTarget = {
  sets: number;
  reps: number;
  repsMax: number | null;
};

export type ExerciseSession = {
  date: string;
  free: boolean;
  equipmentId: string | null;
  equipment: string | null;
  sets: {
    weight: number | null;
    reps: number | null;
    durationSec: number | null;
  }[];
};

export type Suggestion = 'up' | 'down' | null;

const FLOOR_GAP = 2;

export function groupSessions(
  sets: StreakSet[],
  tz?: string,
): ExerciseSession[] {
  const byKey = new Map<string, ExerciseSession>();
  const ordered = [...sets].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  for (const set of ordered) {
    const date = toLocalDateString(set.createdAt, tz);
    const free = set.routineId == null;
    const key = `${date}|${free}|${set.equipmentId ?? ''}`;
    let session = byKey.get(key);
    if (!session) {
      session = {
        date,
        free,
        equipmentId: set.equipmentId,
        equipment: set.equipment?.name ?? null,
        sets: [],
      };
      byKey.set(key, session);
    }
    session.sets.unshift({
      weight: set.weight,
      reps: set.reps,
      durationSec: set.durationSec ?? null,
    });
  }
  return [...byKey.values()];
}

const sameLoad = (a: ExerciseSession, b: ExerciseSession) =>
  a.equipmentId === b.equipmentId && a.sets[0]?.weight === b.sets[0]?.weight;

const atTop = (session: ExerciseSession, top: number) =>
  session.sets.every(
    (s) => (s.reps ?? 0) >= top && s.weight === session.sets[0].weight,
  );

export function computeStreak(
  sessions: ExerciseSession[],
  target: StreakTarget,
  today: string,
): { streak: number; suggestion: Suggestion } {
  const top = target.repsMax ?? target.reps;
  const floor = target.reps - FLOOR_GAP;
  let routine = sessions.filter((s) => !s.free);

  const [latest, previous] = routine;
  if (
    latest?.date === today &&
    latest.sets.length < target.sets &&
    atTop(latest, top) &&
    (!previous || sameLoad(latest, previous))
  ) {
    routine = routine.slice(1);
  }

  if (routine.length === 0) return { streak: 0, suggestion: null };

  const reference = routine[0];
  let streak = 0;
  for (const session of routine) {
    const complete =
      session.sets.length >= target.sets &&
      atTop(session, top) &&
      sameLoad(session, reference);
    if (!complete) break;
    streak++;
  }

  const belowFloor = reference.sets.some((s) => (s.reps ?? 0) < floor);
  const suggestion: Suggestion = belowFloor
    ? 'down'
    : streak > 0
      ? 'up'
      : null;
  return { streak, suggestion };
}
