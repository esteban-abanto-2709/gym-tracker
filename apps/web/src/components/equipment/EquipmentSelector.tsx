"use client";

import type { Equipment } from "@/lib/types";
import { equipmentIcon } from "@/lib/equipmentIcons";

interface EquipmentSelectorProps {
  equipment: Equipment[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function EquipmentSelector({
  equipment,
  value,
  onChange,
}: EquipmentSelectorProps) {
  if (equipment.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="kicker text-muted-foreground text-[0.6rem]">
        Equipo
      </label>
      <div className="flex flex-wrap gap-2">
        {equipment.map((eq) => {
          const Icon = equipmentIcon(eq.id);
          const selected = value === eq.id;
          return (
            <button
              key={eq.id}
              type="button"
              // Tocar el seleccionado lo deselecciona (queda "sin especificar").
              onClick={() => onChange(selected ? null : eq.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {eq.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
