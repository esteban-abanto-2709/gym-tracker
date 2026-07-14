export type Unit = "kg" | "lb";

export const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

export function toKg(value: number, unit: Unit): number {
  if (unit === "kg") return value;
  return Math.round(lbToKg(value) * 10) / 10;
}

export function convertWeight(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const converted = to === "lb" ? kgToLb(value) : lbToKg(value);
  return roundHalf(converted);
}
