import type { Exercise } from "./types";

const byOfficialThenName = (a: Exercise, b: Exercise) =>
  Number(!!a.createdById) - Number(!!b.createdById) ||
  a.name.localeCompare(b.name);

export const toSearchText = (text: string) =>
  text.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function matchesSearch(exercise: Exercise, query: string): boolean {
  const needle = toSearchText(query);
  return (exercise.searchNames ?? [toSearchText(exercise.name)]).some((name) =>
    name.includes(needle),
  );
}

export function addExercise(list: Exercise[], exercise: Exercise): Exercise[] {
  if (list.some((e) => e.id === exercise.id)) return list;
  return [...list, exercise].sort(byOfficialThenName);
}
