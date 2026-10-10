import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Workout } from "@/lib/types";
import { notifyError } from "@/lib/notify";
import { setMeasure } from "@/lib/setDisplay";

// Local day (browser tz) as YYYY-MM-DD. en-CA formats ISO-like.
function localDay(date: string): string {
  return new Date(date).toLocaleDateString("en-CA");
}

export function useWorkoutHistory() {
  const router = useRouter();

  const [dates, setDates] = useState<string[]>([]);
  const [byDay, setByDay] = useState<Record<string, Workout[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    api
      .get<{ days: string[]; sets: Workout[] }>(routes.api.workouts.days(tz))
      .then(({ days, sets }) => {
        setDates(days);
        if (days[0]) setByDay({ [days[0]]: sets });
      })
      .catch((error) => console.error("Error fetching workouts:", error))
      .finally(() => setLoading(false));
  }, []);

  const activeDate = dates.includes(selectedDate)
    ? selectedDate
    : (dates[0] ?? "");
  const dayLoaded = !activeDate || activeDate in byDay;

  useEffect(() => {
    if (dayLoaded) return;
    api
      .get<Workout[]>(routes.api.workouts.range(activeDate, activeDate))
      .then((sets) => setByDay((prev) => ({ ...prev, [activeDate]: sets })))
      .catch((error) => {
        console.error("Error fetching day:", error);
        notifyError("No se pudo cargar el día");
      });
  }, [activeDate, dayLoaded]);

  const currentWorkouts = useMemo(
    () => byDay[activeDate] ?? [],
    [byDay, activeDate],
  );

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
          weight: exercise.weight?.toString() ?? "",
          reps: exercise.reps?.toString() ?? "",
          durationSec: exercise.durationSec?.toString() ?? "",
          measure: setMeasure(exercise),
        }),
      );
      router.push("/log?repeat=true");
    },
    [router],
  );

  // Open edit modal with pre-filled values
  const handleEditClick = useCallback((workout: Workout) => {
    setEditingWorkout(workout);
    setEditReps(workout.reps?.toString() ?? "");
    setEditWeight(workout.weight?.toString() ?? "");
    setEditDuration(workout.durationSec?.toString() ?? "");
  }, []);

  // Save edited workout
  const saveEdit = useCallback(async () => {
    if (!editingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        const measure = setMeasure(editingWorkout);
        const changes =
          measure === "time"
            ? { durationSec: Number(editDuration) }
            : measure === "reps"
              ? { reps: Number(editReps) }
              : {
                  reps: Number(editReps),
                  weight: Number(editWeight),
                };

        await api.patch(routes.api.workouts.update(editingWorkout.id), changes);

        const day = localDay(editingWorkout.createdAt);
        setByDay((prev) => ({
          ...prev,
          [day]: (prev[day] ?? []).map((w) =>
            w.id === editingWorkout.id ? { ...w, ...changes } : w,
          ),
        }));
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
    editDuration,
  ]);

  // Confirm and delete a workout
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.delete(routes.api.workouts.delete(deletingWorkout.id));
        const day = localDay(deletingWorkout.createdAt);
        const left = (byDay[day] ?? []).filter(
          (w) => w.id !== deletingWorkout.id,
        );
        setByDay((prev) => ({ ...prev, [day]: left }));
        if (left.length === 0) {
          setDates((prev) => prev.filter((d) => d !== day));
        }
        setDeletingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudo borrar el set", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [deletingWorkout, byDay]);

  return {
    // Data
    dates,
    selectedDate: activeDate,
    setSelectedDate,
    currentWorkouts,
    loading: loading || !dayLoaded,

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
    editDuration,
    setEditDuration,
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
