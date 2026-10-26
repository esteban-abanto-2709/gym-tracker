"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { flushPendingSets } from "@/lib/pendingSets";
import { routes } from "@/lib/routes";
import type { Equipment, SetType } from "@/lib/types";
import {
  formatRepRange,
  rampSuggestedWeight,
  type SetPlan,
} from "@/lib/blocks";
import { convertWeight, toKg, type Unit } from "@/lib/units";
import { getLastEquipment } from "@/lib/equipmentMemory";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { formatClock, formatDuration, type SetMeasure } from "@/lib/setDisplay";
import { DurationField } from "@/components/DurationPicker";
import { MeasureSelector } from "@/components/MeasureSelector";
import { UnitToggle } from "@/components/UnitToggle";
import { ArrowUp, Check } from "lucide-react";
import { Button } from "@/components/base/button";
import { Spinner } from "@/components/base/spinner";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

interface Recommendation {
  lastWeight: number | null;
  lastReps: number | null;
  lastDurationSec: number | null;
  lastMeasure: SetMeasure | null;
  workingWeight: number | null;
}

const roundToHalf = (value: number) => Math.round(value * 2) / 2;

export interface LogSetInput {
  weightKg?: number | null;
  reps?: number | null;
  durationSec?: number | null;
  equipmentId?: string | null;
  setType?: SetType;
  step?: number | null;
}

interface SetFormProps {
  exerciseId: string;
  plan: SetPlan;
  selectable: boolean;
  preferLastMeasure: boolean;
  equipment: Equipment[];
  logging: boolean;
  onLog: (args: LogSetInput) => Promise<void>;
}

const inputClass = cn(
  surfaceClass,
  "w-full px-4 py-4 text-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono",
);

export function SetForm({
  exerciseId,
  plan,
  selectable,
  preferLastMeasure,
  equipment,
  logging,
  onLog,
}: SetFormProps) {
  const { setType, targetReps, targetRepsMax, targetDurationSec, step, pct } =
    plan;
  const [measure, setMeasure] = useState<SetMeasure>(plan.measure);
  const measureTouched = useRef(false);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [reps, setReps] = useState(targetReps?.toString() ?? "");
  const [seconds, setSeconds] = useState(targetDurationSec?.toString() ?? "");
  const [equipmentId, setEquipmentId] = useState<string | null>(() =>
    getLastEquipment(exerciseId),
  );
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );

  const prefillKey = [
    exerciseId,
    preferLastMeasure,
    setType,
    targetReps,
    targetDurationSec,
    equipmentId,
    step,
    pct,
  ].join("|");
  const [prevPrefillKey, setPrevPrefillKey] = useState(prefillKey);
  if (prefillKey !== prevPrefillKey) {
    setPrevPrefillKey(prefillKey);
    setUnit("kg");
    setWeight("");
    setReps(targetReps?.toString() ?? "");
    setSeconds(targetDurationSec?.toString() ?? "");
    setRecommendation(null);
  }

  useEffect(() => {
    let active = true;
    flushPendingSets()
      .then(() =>
        api.get<Recommendation>(
          routes.api.workouts.recommendation(
            exerciseId,
            equipmentId,
            setType,
            step,
          ),
        ),
      )
      .then((rec) => {
        if (!active) return;
        setRecommendation(rec);
        if (preferLastMeasure && !measureTouched.current && rec.lastMeasure)
          setMeasure(rec.lastMeasure);
        if (rec.lastWeight != null) setWeight(String(rec.lastWeight));
        else if (pct != null && rec.workingWeight != null)
          setWeight(String(roundToHalf((rec.workingWeight * pct) / 100)));
        if (rec.lastReps != null) setReps(String(rec.lastReps));
        if (rec.lastDurationSec != null)
          setSeconds(String(rec.lastDurationSec));
      })
      .catch((e) => console.error("Error fetching recommendation:", e));

    return () => {
      active = false;
    };
  }, [
    exerciseId,
    preferLastMeasure,
    setType,
    targetReps,
    targetDurationSec,
    equipmentId,
    step,
    pct,
  ]);

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

  const incomplete =
    measure === "time"
      ? !(Number(seconds) > 0)
      : reps === "" || (measure === "weight_reps" && weight === "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (incomplete) return;
    if (measure === "time") {
      await onLog({
        durationSec: Number(seconds),
        setType,
        step,
      });
      return;
    }
    await onLog({
      weightKg: measure === "weight_reps" ? toKg(Number(weight), unit) : null,
      reps: Number(reps),
      equipmentId,
      setType,
      step,
    });
  };

  const suggestedWeight =
    setType === "RAMP"
      ? rampSuggestedWeight(
          pct,
          recommendation?.lastWeight ?? null,
          recommendation?.workingWeight ?? null,
        )
      : null;

  const lastLabel = (() => {
    if (!recommendation) return "Sin registro previo";
    const { lastWeight, lastReps, lastDurationSec } = recommendation;
    if (measure === "time") {
      if (lastDurationSec == null) return "Sin registro previo";
      const d = formatDuration(lastDurationSec);
      return `La última vez · ${d.value} ${d.unit}`;
    }
    if (measure === "reps") {
      return lastReps != null
        ? `La última vez · ${lastReps} reps`
        : "Sin registro previo";
    }
    return lastWeight != null
      ? `La última vez · ${lastWeight} kg × ${lastReps}`
      : "Sin registro previo";
  })();

  const repsInput = (
    <div className="space-y-2">
      <label className="kicker text-muted-foreground text-4xs">
        Reps
        {targetReps
          ? ` · meta ${formatRepRange(targetReps, targetRepsMax)}`
          : ""}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className={inputClass}
        required
        autoComplete="off"
        data-1p-ignore
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3" autoComplete="off">
      <div className="text-center space-y-2">
        <p className="kicker text-4xs text-muted-foreground">
          {setType === "WARMUP" && `Calentamiento · `}
          {setType === "RAMP" && `Rampa ${step} · `}
          {lastLabel}
        </p>
        {setType === "RAMP" &&
          pct != null &&
          recommendation?.workingWeight != null && (
            <p className="text-xs text-muted-foreground">
              ≈ {pct} % de {recommendation.workingWeight} kg
            </p>
          )}
        {suggestedWeight != null && (
          <div className="inline-flex items-center gap-2 bg-success/15 text-success rounded-full px-4 py-1.5 text-sm font-bold">
            <ArrowUp className="w-4 h-4" strokeWidth={3} />
            Sube a {suggestedWeight} kg
          </div>
        )}
      </div>

      {selectable && (
        <MeasureSelector
          value={measure}
          onChange={(value) => {
            measureTouched.current = true;
            setMeasure(value);
          }}
        />
      )}

      {measure === "time" && (
        <div className="space-y-2">
          <label className="kicker text-muted-foreground text-4xs">
            Tiempo
            {targetDurationSec
              ? ` · meta ${formatClock(targetDurationSec)}`
              : ""}
          </label>
          <DurationField value={seconds} onChange={setSeconds} label="Tiempo" />
        </div>
      )}

      {measure === "reps" && repsInput}

      {measure === "weight_reps" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="kicker text-muted-foreground text-4xs">
                Peso ({unit})
              </label>
              <UnitToggle unit={unit} onToggle={toggleUnit} />
            </div>
            <input
              type="number"
              step="0.5"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputClass}
              required
              autoComplete="off"
              data-1p-ignore
            />
          </div>

          {repsInput}
        </div>
      )}

      {measure !== "time" && (
        <EquipmentSelector
          equipment={equipment}
          value={equipmentId}
          onChange={setEquipmentId}
        />
      )}

      <Button type="submit" disabled={logging || incomplete}>
        {logging ? (
          <>
            <Spinner className="size-5" />
            Guardando...
          </>
        ) : (
          <>
            <Check className="w-6 h-6" strokeWidth={3} />
            Registrar serie
          </>
        )}
      </Button>
    </form>
  );
}
