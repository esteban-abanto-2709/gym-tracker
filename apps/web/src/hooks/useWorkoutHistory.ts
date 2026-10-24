import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { SessionPage, SessionSummary, Workout } from "@/lib/types";
import { notifyError } from "@/lib/notify";
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

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [first, setFirst] = useState<string | null>(null);
  const [setsBySession, setSetsBySession] = useState<Record<string, Workout[]>>(
    {},
  );
  const [selectedId, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Edit and Delete state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api
      .get<SessionPage>(routes.api.sessions.list())
      .then((page) => {
        setSessions(page.sessions);
        setNext(page.next);
        setFirst(page.first);
      })
      .catch((error) => console.error("Error fetching sessions:", error))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await api.get<SessionPage>(routes.api.sessions.list(next));
      setSessions((prev) => [...prev, ...page.sessions]);
      setNext(page.next);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      notifyError("No se pudieron cargar más sesiones");
    } finally {
      setLoadingMore(false);
    }
  }, [next, loadingMore]);

  const currentSession =
    sessions.find((s) => s.id === selectedId) ?? sessions[0] ?? null;
  const activeId = currentSession?.id ?? "";
  const sessionLoaded = !activeId || activeId in setsBySession;

  useEffect(() => {
    if (sessionLoaded) return;
    api
      .get<{ sets: Workout[] }>(routes.api.sessions.one(activeId))
      .then(({ sets }) =>
        setSetsBySession((prev) => ({ ...prev, [activeId]: sets })),
      )
      .catch((error) => {
        console.error("Error fetching session:", error);
        notifyError("No se pudo cargar la sesión");
      });
  }, [activeId, sessionLoaded]);

  const currentWorkouts = useMemo(
    () => setsBySession[activeId] ?? [],
    [setsBySession, activeId],
  );

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

        setSetsBySession((prev) => ({
          ...prev,
          [activeId]: (prev[activeId] ?? []).map((w) =>
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
  }, [editingWorkout, editReps, editWeight, editDuration, activeId]);

  // Confirm and delete a workout
  const confirmDelete = useCallback(async () => {
    if (!deletingWorkout) return;
    setActionLoading(true);
    const run = async () => {
      try {
        await api.delete(routes.api.workouts.delete(deletingWorkout.id));
        const left = (setsBySession[activeId] ?? []).filter(
          (w) => w.id !== deletingWorkout.id,
        );
        setSetsBySession((prev) => ({ ...prev, [activeId]: left }));
        setSessions((prev) =>
          left.length === 0
            ? prev.filter((s) => s.id !== activeId)
            : prev.map((s) =>
                s.id === activeId ? { ...s, sets: left.length } : s,
              ),
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
  }, [deletingWorkout, setsBySession, activeId]);

  return {
    // Data
    sessions,
    currentSession,
    setSelectedSession,
    currentWorkouts,
    loading: loading || !sessionLoaded,
    hasMore: next != null,
    loadMore,
    loadingMore,
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
