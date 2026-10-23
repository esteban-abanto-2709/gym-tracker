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
  it("returns every step numbered at the start", () => {
    expect(pendingRampSteps(blocks, 0)).toEqual([
      { step: 1, reps: 10, pct: 50 },
      { step: 2, reps: 5, pct: 70 },
      { step: 3, reps: 3, pct: 85 },
    ]);
  });

  it("returns only the remaining steps when some are done", () => {
    expect(pendingRampSteps(blocks, 2)).toEqual([
      { step: 3, reps: 3, pct: 85 },
    ]);
  });

  it("returns nothing outside the ramp", () => {
    expect(pendingRampSteps(blocks, 3)).toEqual([]);
  });

  it("past the plan it does not repeat the ramp even as the last block", () => {
    expect(pendingRampSteps(blocks.slice(0, 1), 3)).toEqual([]);
  });
});
