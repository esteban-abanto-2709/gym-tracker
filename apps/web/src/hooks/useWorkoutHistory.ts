import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Workout } from "@/lib/types";
import { notifyError } from "@/lib/notify";

export function useWorkoutHistory() {
  const router = useRouter();

  // State for lazy-loading and caching
  const [dates, setDates] = useState<string[]>([]);
  const [cachedWorkouts, setCachedWorkouts] = useState<
    Record<string, Workout[]>
  >({});
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editOpinion, setEditOpinion] = useState("");
  const [editApproximation, setEditApproximation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch dates + load the most recent day on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fetchedDates = await api.get<string[]>(
          routes.api.workouts.dates(),
        );
        setDates(fetchedDates);

        if (fetchedDates.length > 0) {
          const initialDate = fetchedDates[0];
          setSelectedDate(initialDate);

          const initialWorkouts = await api.get<Workout[]>(
            routes.api.workouts.list(initialDate),
          );
          setCachedWorkouts({ [initialDate]: initialWorkouts });
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchInitialData();
  }, []);

  // Lazy-load workouts when selecting a new date
  useEffect(() => {
    if (!selectedDate) return;
    if (cachedWorkouts[selectedDate] !== undefined) return;

    const fetchDayWorkouts = async () => {
      setLoadingWorkouts(true);
      try {
        const data = await api.get<Workout[]>(
          routes.api.workouts.list(selectedDate),
        );
        setCachedWorkouts((prev) => ({ ...prev, [selectedDate]: data }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingWorkouts(false);
      }
    };

    fetchDayWorkouts();
  }, [selectedDate, cachedWorkouts]);

  // Format date string to human-readable
  const getDisplayDate = useCallback((dateStr: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));

    if (dateObj.toDateString() === today.toDateString()) return "Hoy";
    if (dateObj.toDateString() === yesterday.toDateString()) return "Ayer";

    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    })
      .format(dateObj)
      .replace(/^\w/, (c) => c.toUpperCase());
  }, []);

  // Repeat a workout set
  const handleRepeat = useCallback(
    (exercise: Workout) => {
      sessionStorage.setItem(
        "gymtrack-last-set",
        JSON.stringify({
          exerciseId: exercise.exercise.id,
          weight: exercise.weight.toString(),
          reps: exercise.reps.toString(),
        }),
      );
      router.push("/log?repeat=true");
    },
    [router],
  );

  // Open edit modal with pre-filled values
  const handleEditClick = useCallback((workout: Workout) => {
    setEditingWorkout(workout);
    setEditReps(workout.reps.toString());
    setEditWeight(workout.weight.toString());
    setEditOpinion(workout.opinion);
    setEditApproximation(workout.isApproximation ?? false);
  }, []);

  // Save edited workout
  const saveEdit = useCallback(async () => {
    if (!editingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.patch(routes.api.workouts.update(editingWorkout.id), {
          reps: Number(editReps),
          weight: Number(editWeight),
          opinion: editOpinion,
          isApproximation: editApproximation,
        });

        setCachedWorkouts((prev) => {
          const dayWorkouts = prev[selectedDate] || [];
          return {
            ...prev,
            [selectedDate]: dayWorkouts.map((ex) =>
              ex.id === editingWorkout.id
                ? {
                    ...ex,
                    reps: Number(editReps),
                    weight: Number(editWeight),
                    opinion: editOpinion,
                    isApproximation: editApproximation,
                  }
                : ex,
            ),
          };
        });
        setEditingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudieron guardar los cambios", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [
    editingWorkout,
    editReps,
    editWeight,
    editOpinion,
    editApproximation,
    selectedDate,
  ]);

  // Confirm and delete a workout
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.delete(routes.api.workouts.delete(deletingWorkout.id));

        setCachedWorkouts((prev) => {
          const dayWorkouts = prev[selectedDate] || [];
          return {
            ...prev,
            [selectedDate]: dayWorkouts.filter(
              (ex) => ex.id !== deletingWorkout.id,
            ),
          };
        });

        setDeletingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudo borrar el set", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [deletingWorkout, selectedDate]);

  const currentWorkouts = cachedWorkouts[selectedDate] || [];

  return {
    // Data
    dates,
    selectedDate,
    setSelectedDate,
    currentWorkouts,
    loadingDates,
    loadingWorkouts,
    cachedWorkouts,

    // Helpers
    getDisplayDate,
    handleRepeat,

    // Edit
    editingWorkout,
    setEditingWorkout,
    editReps,
    setEditReps,
    editWeight,
    setEditWeight,
    editOpinion,
    setEditOpinion,
    editApproximation,
    setEditApproximation,
    handleEditClick,
    saveEdit,

    // Delete
    deletingWorkout,
    setDeletingWorkout,
    confirmDelete,

    // Shared
    actionLoading,
  };
}
