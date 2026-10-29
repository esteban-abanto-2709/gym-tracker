import type { useTranslations } from "next-intl";
import type { BodyMeasurement, Workout } from "@/lib/types";
import { ageOn } from "@/lib/measurements";

export const EXPORT_FORMAT = "gym-tracker-export v1";

export interface ExportInput {
  workouts: Workout[];
  measurements: BodyMeasurement[];
  birthDate: string | null;
  from: string;
  to: string;
  now?: Date;
  timeZone?: string;
  t: ReturnType<typeof useTranslations<"export.doc">>;
  equipmentName: (id: string | null, fallback: string) => string;
}

export interface ExportStats {
  sets: number;
  days: number;
  exercises: number;
  firstDay: string | null;
  lastDay: string | null;
}

function csvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const csvRow = (cells: (string | number | null | undefined)[]) =>
  cells.map(csvCell).join(",");

function localParts(iso: string, timeZone: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return { day, time };
}

export function buildExport({
  workouts,
  measurements,
  birthDate,
  from,
  to,
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  t,
  equipmentName,
}: ExportInput): { markdown: string; stats: ExportStats } {
  const rows = workouts
    .map((w) => ({ w, ...localParts(w.createdAt, timeZone) }))
    .filter(({ day }) => day >= from && day <= to)
    .sort((a, b) => a.w.createdAt.localeCompare(b.w.createdAt));

  const days = [...new Set(rows.map((r) => r.day))];
  const stats: ExportStats = {
    sets: rows.length,
    days: days.length,
    exercises: new Set(rows.map((r) => r.w.exercise.name)).size,
    firstDay: days[0] ?? null,
    lastDay: days[days.length - 1] ?? null,
  };

  const today = localParts(now.toISOString(), timeZone);
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const inRange = sorted.filter((m) => m.date >= from && m.date <= to);
  const baseline = sorted.filter((m) => m.date < from).at(-1);
  const shownMeasurements = baseline ? [baseline, ...inRange] : inRange;

  const lines = [
    t("title", { from, to }),
    "",
    t("format", {
      format: EXPORT_FORMAT,
      day: today.day,
      time: today.time,
      timeZone,
    }),
    "",
    stats.sets > 0
      ? t("range", {
          from,
          to,
          first: stats.firstDay ?? "",
          last: stats.lastDay ?? "",
          days: stats.days,
          sets: stats.sets,
          exercises: stats.exercises,
        })
      : t("rangeEmpty", { from, to }),
    "",
    t("aboutMe"),
    birthDate
      ? t("age", { age: ageOn(birthDate, today.day) })
      : t("ageUnknown"),
    "",
    t("measurements"),
  ];

  if (shownMeasurements.length === 0) {
    lines.push(t("noMeasurements"));
  } else {
    lines.push(t("measurementsNote"));
    if (baseline) {
      lines.push(t("baseline", { date: baseline.date }));
    }
    lines.push(
      "",
      "```csv",
      t("measurementsHeader"),
      ...shownMeasurements.map((m) =>
        csvRow([m.date, m.heightCm, m.weightKg, m.bodyFatPct]),
      ),
      "```",
    );
  }

  lines.push(
    "",
    t("howToRead"),
    t("rule1"),
    t("rule2"),
    t("rule3", { working: t("working"), warmup: t("warmup"), ramp: t("ramp") }),
    t("rule4"),
    t("rule5"),
    t("rule6"),
    t("rule7"),
    t("rule8", { timeZone }),
    "",
    t("sets"),
    "",
  );

  if (rows.length === 0) {
    lines.push(t("noSets"));
  } else {
    lines.push(
      "```csv",
      t("setsHeader"),
      ...rows.map(({ w, day, time }) =>
        csvRow([
          day,
          time,
          w.exercise.name,
          w.equipment && equipmentName(w.equipment.id, w.equipment.name),
          w.setType === "RAMP"
            ? `${t("ramp")} ${w.step ?? ""}`.trim()
            : t(w.setType === "WARMUP" ? "warmup" : "working"),
          w.weight,
          w.reps,
          w.durationSec,
          w.routine?.name,
          w.opinion?.trim() || null,
        ]),
      ),
      "```",
    );
  }

  return { markdown: `${lines.join("\n")}\n`, stats };
}
