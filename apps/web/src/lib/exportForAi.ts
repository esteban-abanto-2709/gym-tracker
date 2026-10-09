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
}

export interface ExportStats {
  sets: number;
  days: number;
  exercises: number;
  firstDay: string | null;
  lastDay: string | null;
}

const SET_TYPE: Record<string, string> = {
  WORKING: "efectiva",
  WARMUP: "calentamiento",
};

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

export const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export function exportFilename(from: string, to: string) {
  return `historial-${from}_${to}.md`;
}

export function buildExport({
  workouts,
  measurements,
  birthDate,
  from,
  to,
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    `# Historial de entrenamiento · ${from} a ${to}`,
    "",
    `Formato: ${EXPORT_FORMAT} · exportado ${today.day} ${today.time} (${timeZone})`,
    "",
    stats.sets > 0
      ? `Período pedido: ${from} a ${to}. Hay series del ${stats.firstDay} al ${stats.lastDay}, en ${plural(stats.days, "día", "días")} (${plural(stats.sets, "serie", "series")}, ${plural(stats.exercises, "ejercicio", "ejercicios")}). Un día sin series no confirma descanso: puede que no se haya registrado.`
      : `Período pedido: ${from} a ${to}. No hay series registradas en este período.`,
    "",
    "## Sobre mí",
    `- Edad: ${birthDate ? `${ageOn(birthDate, today.day)} años` : "no registrada"}`,
    "",
    "## Medidas corporales",
  ];

  if (shownMeasurements.length === 0) {
    lines.push("Sin medidas corporales registradas.");
  } else {
    lines.push(
      "Medidas tomadas cuando quise. Vacío = no medido ese día; no arrastres el valor anterior.",
    );
    if (baseline) {
      lines.push(
        `La primera fila (${baseline.date}) es la última medida antes del período, como punto de partida.`,
      );
    }
    lines.push(
      "",
      "```csv",
      "fecha,altura_cm,peso_kg,grasa_pct",
      ...shownMeasurements.map((m) =>
        csvRow([m.date, m.heightCm, m.weightKg, m.bodyFatPct]),
      ),
      "```",
    );
  }

  lines.push(
    "",
    "## Cómo leer las series",
    "- **Una fila = una serie.** Las series de un mismo día y rutina forman la sesión.",
    "- **Peso en kg.** Barra = total (barra + discos). Mancuerna = el peso de una sola. Máquina y polea = lo que marca el aparato.",
    "- **Tipo:** `efectiva` cuenta para el progreso; `calentamiento` no; `rampa N` es el escalón N de aproximación antes de las efectivas, con peso creciente.",
    "- **Celdas vacías:** sin peso ni reps = serie de tiempo (mira `segundos`); sin peso = peso corporal o solo reps. Equipo vacío = no se registró.",
    "- **Rutina vacía** = día libre, fuera de la rutina.",
    "- **Nota** = lo que escribí sobre esa serie, tal cual.",
    "- **Descanso:** se deduce de la hora de cada serie.",
    `- Fecha y hora en mi zona horaria (${timeZone}).`,
    "",
    "## Series",
    "",
  );

  if (rows.length === 0) {
    lines.push("Sin series en este período.");
  } else {
    lines.push(
      "```csv",
      "fecha,hora,ejercicio,equipo,tipo,peso_kg,reps,segundos,rutina,nota",
      ...rows.map(({ w, day, time }) =>
        csvRow([
          day,
          time,
          w.exercise.name,
          w.equipment?.name,
          w.setType === "RAMP"
            ? `rampa ${w.step ?? ""}`.trim()
            : SET_TYPE[w.setType ?? "WORKING"],
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
