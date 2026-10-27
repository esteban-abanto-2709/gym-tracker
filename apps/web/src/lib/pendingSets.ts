import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { getQueryClient } from "@/lib/query";
import { activeProgramQuery } from "@/lib/queries";
import type { SetType } from "@/lib/types";

const KEY = "gymtrack-pending-sets";

let owner: string | null = null;

const key = () => (owner ? `${KEY}:${owner}` : KEY);

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
      await api.post(routes.api.workouts.create(), {
        ...set.body,
        clientId: set.clientId,
      });
      writePendingSets(
        readPendingSets().filter((s) => s.clientId !== set.clientId),
      );
      sent++;
    }
  } catch (e) {
    console.error("Error sending pending sets:", e);
  }
  if (sent > 0) {
    getQueryClient().invalidateQueries({
      queryKey: activeProgramQuery.queryKey,
    });
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
