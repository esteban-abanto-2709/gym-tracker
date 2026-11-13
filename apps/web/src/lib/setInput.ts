import type { SetMeasure } from "@/lib/setDisplay";

export const validCount = (value: string): boolean =>
  Number.isInteger(Number(value)) && Number(value) > 0;

export const validWeight = (value: string): boolean =>
  value.trim() !== "" && Number(value) >= 0;

export function setInputComplete(
  measure: SetMeasure,
  input: { weight: string; reps: string; seconds: string },
): boolean {
  if (measure === "time") return validCount(input.seconds);
  if (measure === "reps") return validCount(input.reps);
  return validCount(input.reps) && validWeight(input.weight);
}
