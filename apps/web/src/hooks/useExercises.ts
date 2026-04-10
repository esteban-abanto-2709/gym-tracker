import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment, Exercise } from "@/lib/types";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [search, setSearch] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);

  // Fetch exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await api.get<Exercise[]>(routes.api.exercises.list());
        setExercises(data);
      } catch (e) {
        console.error("Error fetching exercises:", e);
      } finally {
        setLoadingExercises(false);
      }
    };
    fetchExercises();
  }, []);

  // Derived: filtered exercises based on search term
  const filteredExercises = exercises.filter((ex) =>
    `${ex.name} ${ex.equipment}`.toLowerCase().includes(search.toLowerCase()),
  );

  // Create a new exercise and add it to the local list
  const createExercise = useCallback(
    async (name: string, equipment: Equipment): Promise<Exercise> => {
      setCreatingExercise(true);
      try {
        const created = await api.post<Exercise>(
          routes.api.exercises.create(),
          { name: name.trim(), equipment },
        );

        setExercises((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );

        return created;
      } finally {
        setCreatingExercise(false);
      }
    },
    [],
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
