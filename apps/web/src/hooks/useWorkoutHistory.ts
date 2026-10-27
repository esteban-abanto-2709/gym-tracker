import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { SessionSummary, Workout } from "@/lib/types";
import { notifyError } from "@/lib/notify";
import { sessionQuery, sessionsQuery } from "@/lib/queries";
import { setMeasure } from "@/lib/setDisplay";

const localDay = (iso: string, timeZone?: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone });

function displayDate(dateStr: string): string {
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
}

const NO_SETS: Workout[] = [];

const sessionDay = (session: SessionSummary) =>
  localDay(session.startedAt, session.timeZone);

const sessionTime = (session: SessionSummary) =>
  new Date(session.startedAt).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: session.timeZone,
  });

export function useWorkoutHistory() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const history = useInfiniteQuery(sessionsQuery);
  const [selectedId, setSelectedSession] = useState("");

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const sessions = useMemo(
    () => history.data?.pages.flatMap((page) => page.sessions) ?? [],
    [history.data],
  );
  const first = history.data?.pages[0]?.first ?? null;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = history;
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    const result = await fetchNextPage();
    if (result.isFetchNextPageError) {
      notifyError("No se pudieron cargar más sesiones");
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const currentSession =
    sessions.find((s) => s.id === selectedId) ?? sessions[0] ?? null;
  const activeId = currentSession?.id ?? "";
  const detail = useQuery(sessionQuery(activeId));
  const currentWorkouts = detail.data?.sets ?? NO_SETS;

  const sessionLabel = useCallback(
    (session: SessionSummary) => {
      const day = sessionDay(session);
      const sameDay = sessions.filter((s) => sessionDay(s) === day).length;
      const label = displayDate(day);
      return sameDay > 1 ? `${label} · ${sessionTime(session)}` : label;
    },
    [sessions],
  );

  const sessionTitle = useCallback(
    (session: SessionSummary) =>
      `${sessionLabel(session)} · ${session.routine?.name ?? "Día libre"}`,
    [sessionLabel],
  );

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

        queryClient.setQueryData(sessionQuery(activeId).queryKey, (prev) =>
          prev
            ? {
                sets: prev.sets.map((w) =>
                  w.id === editingWorkout.id ? { ...w, ...changes } : w,
                ),
              }
            : prev,
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
  }, [
    editingWorkout,
    editReps,
    editWeight,
    editDuration,
    activeId,
    queryClient,
  ]);

  // Confirm and delete a workout
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.delete(routes.api.workouts.delete(deletingWorkout.id));
        const left = currentWorkouts.filter((w) => w.id !== deletingWorkout.id);
        queryClient.setQueryData(sessionQuery(activeId).queryKey, {
          sets: left,
        });
        queryClient.setQueryData(sessionsQuery.queryKey, (prev) =>
          prev
            ? {
                ...prev,
                pages: prev.pages.map((page) => ({
                  ...page,
                  sessions:
                    left.length === 0
                      ? page.sessions.filter((s) => s.id !== activeId)
                      : page.sessions.map((s) =>
                          s.id === activeId ? { ...s, sets: left.length } : s,
                        ),
                })),
              }
            : prev,
        );
        setDeletingWorkout(null);
      } catch (e) {
        console.error(e);
        notifyError("No se pudo borrar el set", run);
      } finally {
        setActionLoading(false);
      }
    };
    await run();
  }, [deletingWorkout, currentWorkouts, activeId, queryClient]);

  return {
    // Data
    sessions,
    currentSession,
    setSelectedSession,
    currentWorkouts,
    loading: history.isPending || (activeId !== "" && detail.isPending),
    hasMore: hasNextPage,
    loadMore,
    loadingMore: isFetchingNextPage,
    firstDay: first ? localDay(first) : null,

    // Helpers
    sessionLabel,
    sessionTitle,
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
