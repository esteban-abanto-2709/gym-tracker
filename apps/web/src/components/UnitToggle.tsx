import type { Unit } from "@/lib/units";

interface UnitToggleProps {
  unit: Unit;
  onToggle: () => void;
}

export function UnitToggle({ unit, onToggle }: UnitToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center text-[10px] font-bold rounded-full border border-input overflow-hidden"
      aria-label="Cambiar unidad de peso"
    >
      {(["kg", "lb"] as const).map((option) => (
        <span
          key={option}
          className={`px-2 py-0.5 transition-colors ${
            unit === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          {option}
        </span>
      ))}
    </button>
  );
}
