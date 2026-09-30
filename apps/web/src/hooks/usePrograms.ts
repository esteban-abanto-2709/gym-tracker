import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { ActiveProgram, Program } from "@/lib/types";

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const [list, active] = await Promise.all([
          api.get<Program[]>(routes.api.programs.list()),
          api.get<ActiveProgram>(routes.api.programs.active()),
        ]);
        setPrograms(list);
        setActiveProgramId(active.program?.id ?? null);
      } catch (e) {
        console.error("Error fetching programs:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const setActive = useCallback(
    async (programId: string | null) => {
      const previous = activeProgramId;
      setActiveProgramId(programId);
      try {
        await api.put(routes.api.programs.active(), { programId });
      } catch (e) {
        console.error("Error setting active program:", e);
        setActiveProgramId(previous);
        notifyError("No se pudo cambiar el programa activo");
      }
    },
    [activeProgramId],
  );

  return { programs, activeProgramId, loading, setActive };
}
