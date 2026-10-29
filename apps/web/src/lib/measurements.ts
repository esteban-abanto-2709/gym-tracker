import type { BodyMeasurement } from "@/lib/types";

export type MeasureField = "weightKg" | "bodyFatPct" | "heightCm";

export const MEASURE_FIELDS: {
  key: MeasureField;
  unit: string;
  min: number;
  max: number;
}[] = [
  { key: "heightCm", unit: "cm", min: 50, max: 250 },
  { key: "weightKg", unit: "kg", min: 20, max: 400 },
  { key: "bodyFatPct", unit: "%", min: 2, max: 70 },
];

export const todayLocal = () => new Date().toLocaleDateString("en-CA");

const parseDate = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function formatShortDate(
  date: string,
  locale: string,
  today = todayLocal(),
): string {
  const sameYear = date.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })
    .format(parseDate(date))
    .replace(".", "");
}

export function ageOn(birthDate: string, today = todayLocal()): number {
  const age = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return today.slice(5) < birthDate.slice(5) ? age - 1 : age;
}

export function latestByField(
  measurements: BodyMeasurement[],
): Record<MeasureField, { value: number; date: string } | null> {
  const latest = (key: MeasureField) => {
    const hit = measurements.find((m) => m[key] != null);
    return hit ? { value: hit[key]!, date: hit.date } : null;
  };
  return {
    weightKg: latest("weightKg"),
    bodyFatPct: latest("bodyFatPct"),
    heightCm: latest("heightCm"),
  };
}

export function formatMeasurement(m: BodyMeasurement): string {
  return MEASURE_FIELDS.filter(({ key }) => m[key] != null)
    .map(({ key, unit }) => `${m[key]} ${unit}`)
    .join(" · ");
}
