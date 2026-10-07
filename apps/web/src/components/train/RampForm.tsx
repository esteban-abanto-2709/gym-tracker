"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment } from "@/lib/types";
import { rampSuggestedWeight, type RampStepPlan } from "@/lib/blocks";
import { convertWeight, roundHalf, toKg, type Unit } from "@/lib/units";
import { getLastEquipment } from "@/lib/equipmentMemory";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { UnitToggle } from "@/components/UnitToggle";
import type { LogSetInput } from "@/components/train/SetForm";
import { ArrowUp, Check, Loader2 } from "lucide-react";

interface Recommendation {
  lastWeight: number | null;
  lastReps: number | null;
  workingWeight: number | null;
}

interface Row {
  reps: string;
  weight: string;
  suggestedKg: number | null;
}

interface RampFormProps {
  exerciseId: string;
  steps: RampStepPlan[];
  equipment: Equipment[];
  logging: boolean;
  onLog: (sets: LogSetInput[]) => Promise<void>;
}

const emptyRows = (steps: RampStepPlan[]): Row[] =>
  steps.map((s) => ({
    reps: s.reps?.toString() ?? "",
    weight: "",
    suggestedKg: null,
  }));

export function RampForm({
  exerciseId,
  steps,
  equipment,
  logging,
  onLog,
}: RampFormProps) {
  const [unit, setUnit] = useState<Unit>("kg");
  const [equipmentId, setEquipmentId] = useState<string | null>(() =>
    getLastEquipment(exerciseId),
  );
  const [rows, setRows] = useState<Row[]>(() => emptyRows(steps));

  useEffect(() => {
    let active = true;
    Promise.all(
      steps.map((s) =>
        api.get<Recommendation>(
          routes.api.workouts.recommendation(
            exerciseId,
            equipmentId,
            "RAMP",
            s.step,
          ),
        ),
      ),
    )
      .then((recs) => {
        if (!active) return;
        setUnit("kg");
        setRows(
          recs.map((rec, i) => {
            const { reps, pct } = steps[i];
            const fromPct =
              pct != null && rec.workingWeight != null
                ? roundHalf((rec.workingWeight * pct) / 100)
                : null;
            const weight = rec.lastWeight ?? fromPct;
            return {
              reps: (reps ?? rec.lastReps)?.toString() ?? "",
              weight: weight?.toString() ?? "",
              suggestedKg: rampSuggestedWeight(
                pct,
                rec.lastWeight,
                rec.workingWeight,
              ),
            };
          }),
        );
      })
      .catch((e) => console.error("Error fetching ramp:", e));

    return () => {
      active = false;
    };
  }, [exerciseId, equipmentId, steps]);

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const applySuggestion = (i: number) => {
    const kg = rows[i].suggestedKg;
    if (kg == null) return;
    updateRow(i, {
      weight: String(convertWeight(kg, "kg", unit)),
      suggestedKg: null,
    });
  };

  const toggleUnit = () => {
    const next: Unit = unit === "kg" ? "lb" : "kg";
    setRows((prev) =>
      prev.map((r) =>
        r.weight === "" || Number.isNaN(Number(r.weight))
          ? r
          : {
              ...r,
              weight: String(convertWeight(Number(r.weight), unit, next)),
            },
      ),
    );
    setUnit(next);
  };

  const incomplete = rows.some((r) => r.reps === "" || r.weight === "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (incomplete) return;
    await onLog(
      rows.map((r, i) => ({
        weightKg: toKg(Number(r.weight), unit),
        reps: Number(r.reps),
        equipmentId,
        setType: "RAMP",
        step: steps[i].step,
      })),
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3" autoComplete="off">
      <div className="flex items-center justify-between">
        <p className="kicker text-[0.6rem] text-muted-foreground">
          {steps.length === 1 ? "1 escalón" : `${steps.length} escalones`}
        </p>
        <UnitToggle unit={unit} onToggle={toggleUnit} />
      </div>

      <ol className="space-y-4">
        {rows.map((row, i) => (
          <li
            key={steps[i].step}
            className="relative rounded-2xl border-2 border-input bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                value={row.reps}
                onChange={(e) => updateRow(i, { reps: e.target.value })}
                aria-label={`Reps del escalón ${steps[i].step}`}
                className="w-14 bg-transparent text-center font-mono text-xl text-muted-foreground focus:outline-none focus:text-foreground"
                autoComplete="off"
                data-1p-ignore
              />
              <span className="text-muted-foreground font-bold">×</span>
              <input
                type="number"
                step="0.5"
                inputMode="decimal"
                value={row.weight}
                onChange={(e) => updateRow(i, { weight: e.target.value })}
                aria-label={`Peso del escalón ${steps[i].step}`}
                className="min-w-0 flex-1 bg-transparent text-right font-mono text-3xl font-bold text-foreground focus:outline-none"
                autoComplete="off"
                data-1p-ignore
              />
              <span className="text-sm font-bold text-muted-foreground w-6">
                {unit}
              </span>
            </div>
            {row.suggestedKg != null && (
              <button
                type="button"
                onClick={() => applySuggestion(i)}
                aria-label={`Sube a ${convertWeight(row.suggestedKg, "kg", unit)} ${unit}`}
                className="absolute -top-3.5 right-4 flex items-center gap-1 rounded-full border-2 border-success bg-card pl-2 pr-2.5 py-0.5 text-success shadow-lg shadow-success/20 transition-all active:scale-95 animate-pop"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={3} />
                <span className="font-display font-bold text-base tabular-nums leading-none">
                  {convertWeight(row.suggestedKg, "kg", unit)} {unit}
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>

      <EquipmentSelector
        equipment={equipment}
        value={equipmentId}
        onChange={setEquipmentId}
      />

      <button
        type="submit"
        disabled={logging || incomplete}
        className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {logging ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Check className="w-6 h-6" strokeWidth={3} />
            Rampa hecha
          </>
        )}
      </button>
    </form>
  );
}
