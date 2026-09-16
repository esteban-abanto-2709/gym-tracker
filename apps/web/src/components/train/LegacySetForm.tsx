"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment, LegacyBlock } from "@/lib/types";
import { convertWeight, toKg, type Unit } from "@/lib/units";
import { getLastEquipment } from "@/lib/equipmentMemory";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { ApproximationToggle } from "@/components/ApproximationToggle";
import { formatDuration } from "@/lib/setDisplay";
import { ArrowUp, Check, Loader2 } from "lucide-react";

interface Recommendation {
  lastWeight: number | null;
  lastReps: number | null;
  lastDurationSec: number | null;
  suggestedWeight: number | null;
}

export interface LogSetInput {
  weightKg?: number | null;
  reps: number;
  durationSec?: number | null;
  opinion?: string;
  equipmentId?: string | null;
  isApproximation?: boolean;
}

interface LegacySetFormProps {
  exerciseId: string;
  isTimed: boolean;
  block: LegacyBlock | null;
  equipment: Equipment[];
  logging: boolean;
  onLog: (args: LogSetInput) => Promise<void>;
}

export function LegacySetForm({
  exerciseId,
  isTimed,
  block,
  equipment,
  logging,
  onLog,
}: LegacySetFormProps) {
  const approx = block?.approx ?? false;
  const targetReps = block?.reps ?? null;
  const targetDurationSec = block?.durationSec ?? null;
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
          approx,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          equipmentId,
        ),
      )
      .then((rec) => {
        if (!active) return;
        setRecommendation(rec);
        if (rec.lastWeight != null) setWeight(String(rec.lastWeight));
        if (rec.lastReps != null) setReps(String(rec.lastReps));
        if (rec.lastDurationSec != null)
          setSeconds(String(rec.lastDurationSec));
      })
      .catch((e) => console.error("Error fetching recommendation:", e));

    return () => {
      active = false;
    };
  }, [exerciseId, targetReps, targetDurationSec, approx, equipmentId]);

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
    if (isTimed) {
      if (seconds === "") return;
      await onLog({ reps: 1, durationSec: Number(seconds), opinion: "" });
      return;
    }
    if (weight === "" || reps === "") return;
    const weightKg = toKg(Number(weight), unit);
    await onLog({
      weightKg,
      reps: Number(reps),
      opinion: "",
      equipmentId,
      isApproximation,
    });
  };

  const lastDuration =
    recommendation?.lastDurationSec != null
      ? formatDuration(recommendation.lastDurationSec)
      : null;
  const lastLabel = isTimed
    ? lastDuration
      ? `La última vez · ${lastDuration.value} ${lastDuration.unit}`
      : "Sin registro previo"
    : recommendation?.lastWeight != null
      ? `La última vez · ${recommendation.lastWeight} kg × ${recommendation.lastReps}`
      : "Sin registro previo";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-3" autoComplete="off">
      <div className="text-center space-y-2">
        <p className="kicker text-[0.6rem] text-muted-foreground">
          {lastLabel}
        </p>
        {recommendation?.suggestedWeight != null && (
          <div className="inline-flex items-center gap-2 bg-success/15 text-success rounded-full px-4 py-1.5 text-sm font-bold">
            <ArrowUp className="w-4 h-4" strokeWidth={3} />
            Sube a {recommendation.suggestedWeight} kg
          </div>
        )}
      </div>

      {isTimed ? (
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
            className="w-full px-4 py-4 text-2xl bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono"
            required
            autoComplete="off"
            data-1p-ignore
          />
        </div>
      ) : (
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
              className="w-full px-4 py-4 text-2xl bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono"
              required
              autoComplete="off"
              data-1p-ignore
            />
          </div>

          <div className="space-y-2">
            <label className="kicker text-muted-foreground text-[0.6rem]">
              Reps{targetReps ? ` · meta ${targetReps}` : ""}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full px-4 py-4 text-2xl bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center font-mono"
              required
              autoComplete="off"
              data-1p-ignore
            />
          </div>
        </div>
      )}

      {!isTimed && (
        <>
          <EquipmentSelector
            equipment={equipment}
            value={equipmentId}
            onChange={setEquipmentId}
          />

          <ApproximationToggle
            checked={isApproximation}
            onChange={setIsApproximation}
            className="justify-center"
          />
        </>
      )}

      <button
        type="submit"
        disabled={
          logging || (isTimed ? seconds === "" : weight === "" || reps === "")
        }
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
