import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ExploreProgram } from "@/lib/types";

export function useExplorePrograms() {
  const [programs, setPrograms] = useState<ExploreProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setPrograms(
          await api.get<ExploreProgram[]>(routes.api.programs.explore()),
        );
      } catch (e) {
        console.error("Error fetching explore programs:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return { programs, loading };
}
