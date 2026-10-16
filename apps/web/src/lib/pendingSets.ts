import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

const KEY = "gymtrack-pending-sets";

export interface PendingSet {
  clientId: string;
  label: string;
  body: {
    exerciseId: string;
    routineId: string;
    reps: number | null;
    weight: number | null;
    durationSec: number | null;
    equipmentId: string | null;
    setType: string;
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

export function readPendingSets(): PendingSet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as PendingSet[];
  } catch {
    return [];
  }
}

function writePendingSets(sets: PendingSet[]): void {
  if (sets.length === 0) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, JSON.stringify(sets));
}

export function addPendingSets(sets: PendingSet[]): void {
  writePendingSets([...readPendingSets(), ...sets]);
}

export function discardPendingSets(): void {
  writePendingSets([]);
}

async function drain(): Promise<number> {
  try {
    for (let set = readPendingSets()[0]; set; set = readPendingSets()[0]) {
      await api.post(routes.api.workouts.create(), {
        ...set.body,
        clientId: set.clientId,
      });
      writePendingSets(
        readPendingSets().filter((s) => s.clientId !== set.clientId),
      );
    }
  } catch (e) {
    console.error("Error sending pending sets:", e);
  }
  return readPendingSets().length;
}

let flushing: Promise<number> | null = null;

export function flushPendingSets(): Promise<number> {
  if (!flushing) {
    flushing = drain().finally(() => {
      flushing = null;
    });
  }
  return flushing;
}
