import {
  Dumbbell,
  Cable,
  Cog,
  PersonStanding,
  Shapes,
  type LucideIcon,
} from "lucide-react";

// Keyed by the fixed Equipment ids seeded in the migration.
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
