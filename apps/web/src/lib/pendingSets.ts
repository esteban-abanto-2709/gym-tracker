import { ApiError, api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { getQueryClient } from "@/lib/query";
import { activeProgramQuery, sessionsQuery } from "@/lib/queries";
import type { SetType } from "@/lib/types";

const KEY = "gymtrack-pending-sets";
const REJECTED_KEY = "gymtrack-rejected-sets";

let owner: string | null = null;

const key = (base = KEY) => (owner ? `${base}:${owner}` : base);

export interface PendingSet {
  clientId: string;
  label: string;
  body: {
    exerciseId: string;
    routineId: string | null;
    sessionId: string;
    performedAt: string;
    timeZone: string;
    reps: number | null;
    weight: number | null;
    durationSec: number | null;
    equipmentId: string | null;
    setType: SetType;
    step: number | null;
  };
}

export type RejectedSet = PendingSet & { reason: string; status: number };

export const newClientId = (): string =>
  crypto.randomUUID?.() ??
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16),
  );

export const setMoment = () => ({
  performedAt: new Date().toISOString(),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export function readPendingSets(): PendingSet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      window.localStorage.getItem(key()) ?? "[]",
    ) as PendingSet[];
  } catch {
    return [];
  }
}

export function readRejectedSets(): RejectedSet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      window.localStorage.getItem(key(REJECTED_KEY)) ?? "[]",
    ) as RejectedSet[];
  } catch {
    return [];
  }
}

function writeRejectedSets(sets: RejectedSet[]): void {
  if (sets.length === 0) window.localStorage.removeItem(key(REJECTED_KEY));
  else window.localStorage.setItem(key(REJECTED_KEY), JSON.stringify(sets));
}

export function discardRejectedSets(): void {
  writeRejectedSets([]);
}

const isRejection = (e: unknown): e is ApiError =>
  e instanceof ApiError &&
  e.status >= 400 &&
  e.status < 500 &&
  ![401, 408, 429].includes(e.status);

function writePendingSets(sets: PendingSet[]): void {
  if (sets.length === 0) window.localStorage.removeItem(key());
  else window.localStorage.setItem(key(), JSON.stringify(sets));
}

export function setPendingOwner(userId: string | null): void {
  if (userId === owner) return;
  const unowned = owner ? [] : readPendingSets();
  owner = userId;
  if (!userId || unowned.length === 0) return;
  writePendingSets([...readPendingSets(), ...unowned]);
  window.localStorage.removeItem(KEY);
}

export function addPendingSets(sets: PendingSet[]): void {
  writePendingSets([...readPendingSets(), ...sets]);
}

export function discardPendingSets(): void {
  writePendingSets([]);
}

async function drain(): Promise<number> {
  let sent = 0;
  try {
    for (let set = readPendingSets()[0]; set; set = readPendingSets()[0]) {
      try {
        await api.post(routes.api.workouts.create(), {
          ...set.body,
          clientId: set.clientId,
        });
        sent++;
      } catch (e) {
        if (!isRejection(e)) throw e;
        writeRejectedSets([
          ...readRejectedSets(),
          { ...set, reason: e.message, status: e.status },
        ]);
      }
      writePendingSets(
        readPendingSets().filter((s) => s.clientId !== set.clientId),
      );
    }
  } catch (e) {
    console.error("Error sending pending sets:", e);
  }
  if (sent > 0) {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: activeProgramQuery.queryKey });
    client.invalidateQueries({ queryKey: sessionsQuery.queryKey });
  }
  return readPendingSets().length;
}

let flushing: Promise<number> | null = null;
let requested = false;

export function flushPendingSets(): Promise<number> {
  requested = true;
  if (!flushing) {
    flushing = (async () => {
      let left = 0;
      while (requested) {
        requested = false;
        left = await drain();
      }
      return left;
    })().finally(() => {
      flushing = null;
    });
  }
  return flushing;
}
