import type { Routine } from "@/lib/types";

const KEY = "gymtrack-active-routine";

export interface ActiveExtra {
  exerciseId: string;
  exercise: { id: string; name: string; equipment: string };
}

export interface ActiveSession {
  routineId: string;
  routineName: string;
  startedAt: string; // ISO
  currentIndex: number;
  progress: Record<number, number>; // combined item index -> sets done
  extras: ActiveExtra[]; // ad-hoc exercises added mid-session
}

function isSameLocalDay(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function readActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    // Auto-expire a session started on a previous day
    if (!isSameLocalDay(parsed.startedAt)) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return { ...parsed, extras: parsed.extras ?? [] };
  } catch {
    return null;
  }
}

export function writeActiveSession(session: ActiveSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function startSession(routine: Routine): ActiveSession {
  const session: ActiveSession = {
    routineId: routine.id,
    routineName: routine.name,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    progress: {},
    extras: [],
  };
  writeActiveSession(session);
  return session;
}

export function totalSetsDone(progress: Record<number, number>): number {
  return Object.values(progress).reduce((sum, n) => sum + n, 0);
}
