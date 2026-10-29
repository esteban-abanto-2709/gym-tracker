import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { programsQuery, refetchAll, routinesQuery } from "@/lib/queries";
import type { Routine } from "@/lib/types";

const NONE: Routine[] = [];

export function useRoutines() {
  const t = useTranslations("routines");
  const queryClient = useQueryClient();
  const { data: routines = NONE, isPending: loading } = useQuery(routinesQuery);
  const [deletingRoutine, setDeletingRoutine] = useState<Routine | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const confirmDelete = useCallback(async () => {
    if (!deletingRoutine) return;
    setActionLoading(true);
    try {
      await api.delete(routes.api.routines.delete(deletingRoutine.id));
      queryClient.setQueryData(routinesQuery.queryKey, (prev) =>
        prev?.filter((r) => r.id !== deletingRoutine.id),
      );
      refetchAll(queryClient, programsQuery);
      setDeletingRoutine(null);
    } catch {
      notifyError(t("deleteError"));
    } finally {
      setActionLoading(false);
    }
  }, [deletingRoutine, queryClient, t]);

  return {
    routines,
    loading,
    deletingRoutine,
    setDeletingRoutine,
    confirmDelete,
    actionLoading,
  };
}
