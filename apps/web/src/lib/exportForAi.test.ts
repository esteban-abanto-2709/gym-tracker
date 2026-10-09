import { describe, it, expect } from "vitest";
import { buildExport, exportFilename } from "./exportForAi";
import type { Workout } from "./types";

const set = (createdAt: string, overrides: Partial<Workout> = {}): Workout => ({
  id: createdAt,
  exerciseId: "bench",
  exercise: { id: "bench", name: "Press banca" },
  equipment: { id: "barra", name: "Barra" },
  weight: 80,
  reps: 8,
  durationSec: null,
  routine: { name: "Upper A" },
  setType: "WORKING",
  step: null,
  opinion: "",
  createdAt,
  ...overrides,
});

const base = {
  measurements: [],
  birthDate: null,
  from: "2026-09-09",
  to: "2026-10-09",
  now: new Date("2026-10-09T23:40:00Z"),
  timeZone: "America/Lima",
};

const seriesRows = (markdown: string) =>
  markdown.split("## Series")[1].split("\n").filter((l) => /^\d{4}-/.test(l));

describe("buildExport", () => {
  it("usa la fecha y hora local, ordena y filtra por el rango pedido", () => {
    const { markdown, stats } = buildExport({
      ...base,
      workouts: [
        set("2026-09-12T23:30:00Z"),
        set("2026-09-09T04:00:00Z"),
        set("2026-10-10T04:30:00Z"),
      ],
    });

    expect(seriesRows(markdown)).toEqual([
      "2026-09-12,18:30,Press banca,Barra,efectiva,80,8,,Upper A,",
      "2026-10-09,23:30,Press banca,Barra,efectiva,80,8,,Upper A,",
    ]);
    expect(stats).toMatchObject({ sets: 2, days: 2, exercises: 1 });
    expect(markdown).toContain(
      "Hay series del 2026-09-12 al 2026-10-09, en 2 días (2 series, 1 ejercicio)",
    );
    expect(markdown).toContain("exportado 2026-10-09 18:40 (America/Lima)");
  });

  it("deja vacio lo que no aplica y escapa notas con comas y comillas", () => {
    const { markdown } = buildExport({
      ...base,
      workouts: [
        set("2026-09-12T23:30:00Z", {
          exercise: { id: "plank", name: "Plank" },
          equipment: null,
          weight: null,
          reps: null,
          durationSec: 45,
          routine: null,
          opinion: 'Bien, pero "temblando"',
        }),
        set("2026-09-12T23:35:00Z", { setType: "RAMP", step: 2 }),
      ],
    });

    expect(seriesRows(markdown)).toEqual([
      '2026-09-12,18:30,Plank,,efectiva,,,45,,"Bien, pero ""temblando"""',
      "2026-09-12,18:35,Press banca,Barra,rampa 2,80,8,,Upper A,",
    ]);
  });

  it("incluye la ultima medida anterior como punto de partida y la edad", () => {
    const { markdown } = buildExport({
      ...base,
      birthDate: "2000-10-10",
      workouts: [],
      measurements: [
        { date: "2026-08-01", heightCm: 171, weightKg: 81, bodyFatPct: null },
        { date: "2026-09-01", heightCm: 172, weightKg: 80.2, bodyFatPct: 20.1 },
        { date: "2026-10-08", heightCm: null, weightKg: 77.9, bodyFatPct: null },
      ],
    });

    expect(markdown).toContain("- Edad: 25 años");
    expect(markdown).toContain("La primera fila (2026-09-01) es la última medida antes del período");
    expect(markdown).toContain("2026-09-01,172,80.2,20.1\n2026-10-08,,77.9,\n");
    expect(markdown).not.toContain("2026-08-01");
    expect(markdown).toContain("No hay series registradas en este período.");
  });

  it("sin medidas ni nacimiento lo dice en vez de dejar huecos", () => {
    const { markdown } = buildExport({ ...base, workouts: [] });

    expect(markdown).toContain("- Edad: no registrada");
    expect(markdown).toContain("Sin medidas corporales registradas.");
    expect(markdown).toContain("Formato: gym-tracker-export v1");
    expect(exportFilename(base.from, base.to)).toBe(
      "historial-2026-09-09_2026-10-09.md",
    );
  });
});
