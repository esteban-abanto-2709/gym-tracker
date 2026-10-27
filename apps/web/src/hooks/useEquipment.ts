import { useQuery } from "@tanstack/react-query";
import { equipmentQuery } from "@/lib/queries";
import type { Equipment } from "@/lib/types";

const NONE: Equipment[] = [];

export function useEquipment() {
  const { data = NONE } = useQuery(equipmentQuery);
  return { equipment: data };
}
