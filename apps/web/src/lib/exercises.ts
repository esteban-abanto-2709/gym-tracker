import type { Exercise } from "./types";

const byOfficialThenName = (a: Exercise, b: Exercise) =>
  Number(!!a.createdById) - Number(!!b.createdById) ||
  a.name.localeCompare(b.name);

export function addExercise(list: Exercise[], exercise: Exercise): Exercise[] {
  if (list.some((e) => e.id === exercise.id)) return list;
  return [...list, exercise].sort(byOfficialThenName);
}
