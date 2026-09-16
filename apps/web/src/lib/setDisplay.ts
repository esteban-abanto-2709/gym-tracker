export interface SetMetric {
  value: string;
  unit: string;
}

interface DisplayableSet {
  weight?: number | null;
  reps?: number | null;
  durationSec?: number | null;
}

export type SetMeasure = "weight_reps" | "reps" | "time";

export function setMeasure(set: DisplayableSet): SetMeasure {
  if (set.durationSec != null) return "time";
  if (set.weight == null) return "reps";
  return "weight_reps";
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
  const reps = { value: String(set.reps ?? 0), unit: "reps" };
  switch (setMeasure(set)) {
    case "time":
      return [formatDuration(set.durationSec ?? 0)];
    case "reps":
      return [reps];
    case "weight_reps":
      return [{ value: String(set.weight), unit: "kg" }, reps];
  }
}
