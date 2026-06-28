"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { RoutineItem, Workout } from "@/lib/types";
import { convertWeight, lbToKg, type Unit } from "@/lib/units";
import { ApproximationToggle } from "@/components/ApproximationToggle";
import { Loader2 } from "lucide-react";

interface SetLoggerProps {
  item: RoutineItem;
  logging: boolean;
  onLog: (args: {
    weightKg: number;
    reps: number;
    opinion?: string;
    isApproximation?: boolean;
  }) => Promise<void>;
}

export function SetLogger({ item, logging, onLog }: SetLoggerProps) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [reps, setReps] = useState("");
  const [isApproximation, setIsApproximation] = useState(
    item.isApproximation ?? false,
  );
  const [lastSet, setLastSet] = useState<Workout | null>(null);

  // Prefill from the last logged set of this exercise (or the routine target)
  useEffect(() => {
    let active = true;
    setUnit("kg");
    setWeight("");
    setReps(item.targetReps?.toString() ?? "");
    setIsApproximation(item.isApproximation ?? false);
    setLastSet(null);

    api
      .get<Workout | null>(routes.api.workouts.last(item.exerciseId))
      .then((last) => {
        if (!active || !last) return;
        setLastSet(last);
        setWeight(String(last.weight));
        setReps(String(last.reps));
      })
      .catch((e) => console.error("Error fetching last set:", e));

    return () => {
      active = false;
    };
  }, [item.exerciseId, item.targetReps, item.isApproximation]);

  const toggleUnit = () => {
    setUnit((prev) => {
      const next: Unit = prev === "kg" ? "lb" : "kg";
      setWeight((current) => {
        if (current === "") return current;
        const value = Number(current);
        if (Number.isNaN(value)) return current;
        return String(convertWeight(value, prev, next));
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (weight === "" || reps === "") return;
    const weightKg = unit === "lb" ? lbToKg(Number(weight)) : Number(weight);
    await onLog({ weightKg, reps: Number(reps), opinion: "", isApproximation });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3" autoComplete="off">
      <p className="text-xs text-muted-foreground text-center">
        {lastSet
          ? `Última vez: ${lastSet.weight} kg × ${lastSet.reps} reps`
          : "Sin registro previo de este ejercicio"}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-muted-foreground">
              Peso ({unit})
            </label>
            <button
              type="button"
              onClick={toggleUnit}
              className="flex items-center text-[10px] font-bold rounded-full border border-input overflow-hidden"
              aria-label="Cambiar unidad de peso"
            >
              <span
                className={`px-2 py-0.5 transition-colors ${
                  unit === "kg"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                kg
              </span>
              <span
                className={`px-2 py-0.5 transition-colors ${
                  unit === "lb"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                lb
              </span>
            </button>
          </div>
          <input
            type="number"
            step="0.5"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono"
            required
            autoComplete="off"
            data-1p-ignore
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Reps{item.targetReps ? ` (meta ${item.targetReps})` : ""}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono"
            required
            autoComplete="off"
            data-1p-ignore
          />
        </div>
      </div>

      <ApproximationToggle
        checked={isApproximation}
        onChange={setIsApproximation}
        className="justify-center"
      />

      <button
        type="submit"
        disabled={logging || weight === "" || reps === ""}
        className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {logging ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando...
          </>
        ) : (
          "✓ Registrar serie"
        )}
      </button>
    </form>
  );
}
