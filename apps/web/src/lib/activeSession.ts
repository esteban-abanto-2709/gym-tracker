import type { Routine } from "@/lib/types";
import { newClientId } from "@/lib/pendingSets";

const KEY = "gymtrack-active-routine";
const FREE_KEY = "gymtrack-free-session";

export const SESSION_GAP_MS = 3 * 60 * 60 * 1000;

export interface ActiveExtra {
  exerciseId: string;
  exercise: { id: string; name: string };
}

export interface ActiveSession {
  sessionId: string;
  routineId: string;
  routineName: string;
  startedAt: string; // ISO
  currentIndex: number;
  progress: Record<number, number>; // combined item index -> sets done
  extras: ActiveExtra[]; // ad-hoc exercises added mid-session
  skipped: Record<number, boolean>; // combined item index -> skipped for today
  replacedBy: Record<number, ActiveExtra>; // combined item index -> substitute (inherits the slot's targets)
  lastSetAt?: string;
}

function isStillOpen(lastActivity: string): boolean {
  return Date.now() - new Date(lastActivity).getTime() <= SESSION_GAP_MS;
}

export function readActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    if (!isStillOpen(parsed.lastSetAt ?? parsed.startedAt)) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return {
      ...parsed,
      sessionId: parsed.sessionId ?? newClientId(),
      extras: parsed.extras ?? [],
      skipped: parsed.skipped ?? {},
      replacedBy: parsed.replacedBy ?? {},
    };
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
    sessionId: newClientId(),
    routineId: routine.id,
    routineName: routine.name,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    progress: {},
    extras: [],
    skipped: {},
    replacedBy: {},
  };
  writeActiveSession(session);
  return session;
}

export function totalSetsDone(progress: Record<number, number>): number {
  return Object.values(progress).reduce((sum, n) => sum + n, 0);
}

export function freeSessionId(): string {
  const active = readActiveSession();
  if (active) return active.sessionId;
  try {
    const raw = window.localStorage.getItem(FREE_KEY);
    const free = raw
      ? (JSON.parse(raw) as { id: string; lastSetAt: string })
      : null;
    const id = free && isStillOpen(free.lastSetAt) ? free.id : newClientId();
    window.localStorage.setItem(
      FREE_KEY,
      JSON.stringify({ id, lastSetAt: new Date().toISOString() }),
    );
    return id;
  } catch {
    return newClientId();
  }
}
