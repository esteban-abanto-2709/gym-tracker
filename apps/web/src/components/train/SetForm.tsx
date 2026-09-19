"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment, SetType } from "@/lib/types";
import { rampSuggestedWeight, type SetPlan } from "@/lib/blocks";
import { convertWeight, toKg, type Unit } from "@/lib/units";
import { getLastEquipment } from "@/lib/equipmentMemory";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { ApproximationToggle } from "@/components/ApproximationToggle";
import { formatDuration, type SetMeasure } from "@/lib/setDisplay";
import { MeasureSelector } from "@/components/MeasureSelector";
import { ArrowUp, Check, Loader2 } from "lucide-react";

interface Recommendation {
  lastWeight: number | null;
  lastReps: number | null;
  lastDurationSec: number | null;
  suggestedWeight: number | null;
  lastMeasure: SetMeasure | null;
  workingWeight: number | null;
}

const roundToHalf = (value: number) => Math.round(value * 2) / 2;

export interface LogSetInput {
  weightKg?: number | null;
  reps: number;
  durationSec?: number | null;
  opinion?: string;
  equipmentId?: string | null;
  isApproximation?: boolean;
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

const inputClass =
  "w-full px-4 py-4 text-2xl bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono";

export function SetForm({
  exerciseId,
  plan,
  selectable,
  preferLastMeasure,
  equipment,
  logging,
  onLog,
}: SetFormProps) {
  const { setType, approx, targetReps, targetDurationSec, step, pct } = plan;
  const [measure, setMeasure] = useState<SetMeasure>(plan.measure);
  const measureTouched = useRef(false);
  const isWorkingWeight = measure === "weight_reps" && setType === "WORKING";
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [reps, setReps] = useState("");
  const [seconds, setSeconds] = useState("");
  const [equipmentId, setEquipmentId] = useState<string | null>(() =>
    getLastEquipment(exerciseId),
  );
  const [isApproximation, setIsApproximation] = useState(approx);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );

  // Prefill from the last logged set of this segment (or the routine target)
  useEffect(() => {
    let active = true;
    setUnit("kg");
    setWeight("");
    setReps(targetReps?.toString() ?? "");
    setSeconds(targetDurationSec?.toString() ?? "");
    setIsApproximation(approx);
    setRecommendation(null);

    api
      .get<Recommendation>(
        routes.api.workouts.recommendation(
          exerciseId,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          equipmentId,
          setType,
          step,
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
    approx,
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
      ? seconds === ""
      : reps === "" || (measure === "weight_reps" && weight === "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (incomplete) return;
    if (measure === "time") {
      await onLog({
        reps: 1,
        durationSec: Number(seconds),
        opinion: "",
        setType,
        step,
      });
      return;
    }
    await onLog({
      weightKg: measure === "weight_reps" ? toKg(Number(weight), unit) : null,
      reps: Number(reps),
      opinion: "",
      equipmentId,
      isApproximation: isWorkingWeight && isApproximation,
      setType,
      step,
    });
  };

  const suggestedWeight = isWorkingWeight
    ? (recommendation?.suggestedWeight ?? null)
    : setType === "RAMP"
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
      <label className="kicker text-muted-foreground text-[0.6rem]">
        Reps{targetReps ? ` · meta ${targetReps}` : ""}
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
        <p className="kicker text-[0.6rem] text-muted-foreground">
          {setType === "WARMUP" && `Calentamiento · `}
          {setType === "RAMP" && `Rampa ${step} · `}
          {lastLabel}
        </p>
        {setType === "RAMP" && pct != null && recommendation?.workingWeight != null && (
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
          <label className="kicker text-muted-foreground text-[0.6rem]">
            Segundos
            {targetDurationSec ? ` · meta ${targetDurationSec}` : ""}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className={inputClass}
            required
            autoComplete="off"
            data-1p-ignore
          />
        </div>
      )}

      {measure === "reps" && repsInput}

      {measure === "weight_reps" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="kicker text-muted-foreground text-[0.6rem]">
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

      {isWorkingWeight && (
        <ApproximationToggle
          checked={isApproximation}
          onChange={setIsApproximation}
          className="justify-center"
        />
      )}

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
            Registrar serie
          </>
        )}
      </button>
    </form>
  );
}
