export interface SetMetric {
  value: string;
  unit: string;
}

interface DisplayableSet {
  weight?: number | null;
  reps?: number | null;
  durationSec?: number | null;
}

export function isTimedSet(set: DisplayableSet): boolean {
  return set.durationSec != null;
}

export function formatDuration(totalSec: number): SetMetric {
  if (totalSec < 60) return { value: String(totalSec), unit: "s" };
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return {
    value: `${minutes}:${String(seconds).padStart(2, "0")}`,
    unit: "min",
  };
}

export function setMetrics(set: DisplayableSet): SetMetric[] {
  if (set.durationSec != null) return [formatDuration(set.durationSec)];
  return [
    { value: String(set.weight ?? 0), unit: "kg" },
    { value: String(set.reps ?? 0), unit: "reps" },
  ];
}
