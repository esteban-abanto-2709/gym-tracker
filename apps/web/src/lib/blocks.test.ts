import { describe, it, expect } from "vitest";
import { pendingRampSteps } from "./blocks";
import type { RoutineBlock } from "./types";

const blocks: RoutineBlock[] = [
  {
    kind: "ramp",
    steps: [
      { reps: 10, pct: 50 },
      { reps: 5, pct: 70 },
      { reps: 3, pct: 85 },
    ],
  },
  { kind: "weight_reps", sets: 3, reps: 8, repsMax: 10 },
];

describe("pendingRampSteps", () => {
  it("al empezar devuelve todos los escalones numerados", () => {
    expect(pendingRampSteps(blocks, 0)).toEqual([
      { step: 1, reps: 10, pct: 50 },
      { step: 2, reps: 5, pct: 70 },
      { step: 3, reps: 3, pct: 85 },
    ]);
  });

  it("con escalones ya hechos devuelve solo los que faltan", () => {
    expect(pendingRampSteps(blocks, 2)).toEqual([
      { step: 3, reps: 3, pct: 85 },
    ]);
  });

  it("fuera de la rampa no devuelve nada", () => {
    expect(pendingRampSteps(blocks, 3)).toEqual([]);
  });

  it("pasado el plan no repite la rampa aunque sea el ultimo bloque", () => {
    expect(pendingRampSteps(blocks.slice(0, 1), 3)).toEqual([]);
  });
});
