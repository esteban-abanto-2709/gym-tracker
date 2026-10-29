import { useQuery } from "@tanstack/react-query";
import { useMessages } from "next-intl";
import { equipmentQuery } from "@/lib/queries";
import type { Equipment } from "@/lib/types";

const NONE: Equipment[] = [];

export function useEquipment() {
  const { data = NONE } = useQuery(equipmentQuery);
  return { equipment: data };
}

export function useEquipmentName() {
  const names: Record<string, string> = useMessages().equipment.names;
  return (id: string | null, fallback: string) =>
    (id != null && names[id]) || fallback;
}
