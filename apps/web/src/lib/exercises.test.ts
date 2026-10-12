import { describe, it, expect } from "vitest";
import { addExercise, matchesSearch } from "./exercises";
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

describe("matchesSearch", () => {
  const bench = {
    id: "bench-press",
    name: "Press de banca",
    slug: "bench-press",
    searchNames: ["bench press", "press de banca"],
  } as Exercise;

  it("finds an exercise by its name in any language", () => {
    expect(matchesSearch(bench, "bench")).toBe(true);
    expect(matchesSearch(bench, "press de banca")).toBe(true);
    expect(matchesSearch(bench, "squat")).toBe(false);
  });

  it("ignores accents and case", () => {
    const triceps = {
      ...bench,
      name: "Extensión de tríceps",
      searchNames: ["triceps pushdown", "extension de triceps"],
    } as Exercise;
    expect(matchesSearch(triceps, "EXTENSIÓN DE TRÍCEPS")).toBe(true);
  });

  it("falls back to the shown name when there are no search names", () => {
    const mine = { id: "x", name: "Remo Ráro", slug: "x" } as Exercise;
    expect(matchesSearch(mine, "remo raro")).toBe(true);
  });
});
