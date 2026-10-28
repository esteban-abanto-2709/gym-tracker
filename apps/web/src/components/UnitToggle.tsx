import type { Unit } from "@/lib/units";
import { cn } from "@/lib/utils";

interface UnitToggleProps {
  unit: Unit;
  onToggle: () => void;
}

export function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center text-3xs font-bold rounded-full border border-input overflow-hidden"
    >
      {(["kg", "lb"] as const).map((option) => (
        <span
          key={option}
          className={cn(
            "px-2 py-0.5 transition-colors",
            unit === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          {option}
        </span>
      ))}
      <span className="sr-only">{`, unidad de peso en ${unit}`}</span>
    </button>
  );
}
