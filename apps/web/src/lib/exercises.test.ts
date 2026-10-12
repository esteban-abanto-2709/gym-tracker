import { describe, it, expect } from "vitest";
import { addExercise } from "./exercises";
import type { Exercise } from "./types";

const ex = (id: string, name: string, createdById: string | null = null) =>
  ({ id, name, slug: id, createdById }) as Exercise;

describe("addExercise", () => {
  it("keeps official exercises before user ones", () => {
    const list = [ex("squat", "Squat"), ex("wall-sit", "Wall Sit", "u1")];

    const result = addExercise(list, ex("aaa", "Aaa", "u1"));

    expect(result.map((e) => e.id)).toEqual(["squat", "aaa", "wall-sit"]);
  });

  it("does not duplicate an exercise the API returned instead of creating", () => {
    const list = [ex("bench-press", "Bench Press"), ex("squat", "Squat")];

    const result = addExercise(list, ex("bench-press", "Bench Press"));

    expect(result).toBe(list);
  });
});
