import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Workout } from "@/lib/types";
import { notifyError } from "@/lib/notify";

// Local day (browser tz) as YYYY-MM-DD. en-CA formats ISO-like.
function localDay(date: string): string {
  return new Date(date).toLocaleDateString("en-CA");
}

export function useWorkoutHistory() {
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editOpinion, setEditOpinion] = useState("");
  const [editApproximation, setEditApproximation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load all workouts once; grouping/filtering by local day happens client-side.
  useEffect(() => {
    const run = async () => {
      try {
        const all = await api.get<Workout[]>(routes.api.workouts.list());
        setWorkouts(all);
        if (all.length > 0) setSelectedDate(localDay(all[0].createdAt));
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Distinct local days, newest first (list already comes ordered desc).
  const dates = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const w of workouts) {
      const d = localDay(w.createdAt);
      if (!seen.has(d)) {
        seen.add(d);
        out.push(d);
      }
    }
    return out;
  }, [workouts]);

  const currentWorkouts = useMemo(
    () => workouts.filter((w) => localDay(w.createdAt) === selectedDate),
    [workouts, selectedDate],
  );

  // Keep a valid day selected after deletions empty out the current one.
  useEffect(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

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

        setWorkouts((prev) =>
          prev.map((w) =>
            w.id === editingWorkout.id
              ? {
                  ...w,
                  reps: Number(editReps),
                  weight: Number(editWeight),
                  opinion: editOpinion,
                  isApproximation: editApproximation,
                }
              : w,
          ),
        );
        setEditingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudieron guardar los cambios", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [editingWorkout, editReps, editWeight, editOpinion, editApproximation]);

  // Confirm and delete a workout
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.delete(routes.api.workouts.delete(deletingWorkout.id));
        setWorkouts((prev) => prev.filter((w) => w.id !== deletingWorkout.id));
        setDeletingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudo borrar el set", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [deletingWorkout]);

  return {
    // Data
    dates,
    selectedDate,
    setSelectedDate,
    currentWorkouts,
    loading,

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
