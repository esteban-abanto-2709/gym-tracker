import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { activeProgramQuery, programsQuery } from "@/lib/queries";
import type { Program } from "@/lib/types";

const NONE: Program[] = [];

export function usePrograms() {
  const queryClient = useQueryClient();
  const list = useQuery(programsQuery);
  const active = useQuery(activeProgramQuery);
  const programs = list.data ?? NONE;

  const setActive = useCallback(
    async (programId: string | null) => {
      const { queryKey } = activeProgramQuery;
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, {
        program: programs.find((p) => p.id === programId) ?? null,
        nextRoutineId: null,
      });
      try {
        await api.put(routes.api.programs.active(), { programId });
      } catch (e) {
        console.error("Error setting active program:", e);
        queryClient.setQueryData(queryKey, previous);
        notifyError("No se pudo cambiar el programa activo");
      } finally {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    [programs, queryClient],
  );

  return {
    programs,
    activeProgramId: active.data?.program?.id ?? null,
    nextRoutineId: active.data?.nextRoutineId ?? null,
    loading: list.isPending || active.isPending,
    setActive,
  };
}
