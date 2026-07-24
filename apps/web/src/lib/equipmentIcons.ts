import {
  Dumbbell,
  Cable,
  Cog,
  PersonStanding,
  Shapes,
  type LucideIcon,
} from "lucide-react";

// Iconos por id fijo de Equipment (los ids vienen sembrados en la migración).
const ICONS: Record<string, LucideIcon> = {
  barra: Dumbbell,
  polea: Cable,
  mancuerna: Dumbbell,
  maquina: Cog,
  "peso-corporal": PersonStanding,
  otro: Shapes,
};

export function equipmentIcon(id: string): LucideIcon {
  return ICONS[id] ?? Dumbbell;
}
