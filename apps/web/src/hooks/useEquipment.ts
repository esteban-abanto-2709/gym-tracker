import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment } from "@/lib/types";

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  useEffect(() => {
    api
      .get<Equipment[]>(routes.api.equipment.list())
      .then(setEquipment)
      .catch((e) => console.error("Error fetching equipment:", e))
      .finally(() => setLoadingEquipment(false));
  }, []);

  return { equipment, loadingEquipment };
}
