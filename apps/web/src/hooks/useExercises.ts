import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { exercisesQuery } from "@/lib/queries";
import type { Exercise } from "@/lib/types";
import { addExercise, matchesSearch } from "@/lib/exercises";

const NONE: Exercise[] = [];

export function useExercises() {
  const t = useTranslations("exercises");
  const queryClient = useQueryClient();
  const { data: exercises = NONE, isPending: loadingExercises } =
    useQuery(exercisesQuery);
  const [search, setSearch] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);

  // Derived: filtered exercises based on search term
  const filteredExercises = exercises.filter((ex) => matchesSearch(ex, search));

  // Create a new exercise and add it to the shared list
  const createExercise = useCallback(
    async (name: string): Promise<Exercise> => {
      setCreatingExercise(true);
      try {
        const created = await api.post<Exercise>(
          routes.api.exercises.create(),
          { name: name.trim() },
        );

        queryClient.setQueryData(exercisesQuery.queryKey, (prev) =>
          addExercise(prev ?? [], created),
        );

        return created;
      } catch (e) {
        notifyError(t("createError"));
        throw e;
      } finally {
        setCreatingExercise(false);
      }
    },
    [queryClient, t],
  );

  return {
    exercises,
    loadingExercises,
    search,
    setSearch,
    filteredExercises,
    createExercise,
    creatingExercise,
  };
}
