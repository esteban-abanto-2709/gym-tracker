import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Routine } from "@/lib/types";

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingRoutine, setDeletingRoutine] = useState<Routine | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await api.get<Routine[]>(routes.api.routines.list());
        setRoutines(data);
      } catch (e) {
        console.error("Error fetching routines:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingRoutine) return;
    setActionLoading(true);
    try {
      await api.delete(routes.api.routines.delete(deletingRoutine.id));
      setRoutines((prev) => prev.filter((r) => r.id !== deletingRoutine.id));
      setDeletingRoutine(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }, [deletingRoutine]);

  return {
    routines,
    loading,
    deletingRoutine,
    setDeletingRoutine,
    confirmDelete,
    actionLoading,
  };
}
