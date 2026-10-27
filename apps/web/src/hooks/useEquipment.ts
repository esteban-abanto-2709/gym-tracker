import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment } from "@/lib/types";

const NONE: Equipment[] = [];

export function useEquipment() {
  const { data = NONE } = useQuery({
    queryKey: ["equipment"],
    queryFn: () => api.get<Equipment[]>(routes.api.equipment.list()),
    meta: { errorMessage: "No se pudieron cargar los equipos" },
  });
  return { equipment: data };
}
