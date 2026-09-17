import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Exercise } from "@/lib/types";
import { convertWeight, toKg, type Unit } from "@/lib/units";
import { getLastEquipment, rememberEquipment } from "@/lib/equipmentMemory";
import { notifyError } from "@/lib/notify";
import type { SetMeasure } from "@/lib/setDisplay";

const STORAGE_KEY = "gymtrack-last-set";

interface RepeatData {
  exercise?: Exercise | null;
  exerciseId?: string;
  weight: string;
  reps: string;
  durationSec?: string;
  measure?: SetMeasure;
}

function repeatMeasure(data: RepeatData): SetMeasure {
  if (data.measure) return data.measure;
  if (data.durationSec) return "time";
  return data.weight ? "weight_reps" : "reps";
}

export function useWorkoutForm(
  exercises: Exercise[],
  loadingExercises: boolean,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<Unit>("kg");
  const [reps, setReps] = useState("");
  const [seconds, setSeconds] = useState("");
  const [opinion, setOpinion] = useState("");
  const [isApproximation, setIsApproximation] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [measure, setMeasure] = useState<SetMeasure>("weight_reps");
  const [loading, setLoading] = useState(false);
  const measureTouched = useRef(false);
  const pendingRepeatMeasure = useRef<SetMeasure | null>(null);

  // Al cambiar de ejercicio, el equipo por default = el último que usaste en él.
  useEffect(() => {
    setEquipmentId(
      selectedExercise ? getLastEquipment(selectedExercise.id) : null,
    );
  }, [selectedExercise]);

  useEffect(() => {
    measureTouched.current = false;
    if (!selectedExercise) return;
    if (pendingRepeatMeasure.current) {
      setMeasure(pendingRepeatMeasure.current);
      pendingRepeatMeasure.current = null;
      measureTouched.current = true;
      return;
    }
    setMeasure("weight_reps");

    let active = true;
    api
      .get<{ lastMeasure: SetMeasure | null }>(
        routes.api.workouts.recommendation(
          selectedExercise.id,
          false,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          null,
        ),
      )
      .then((rec) => {
        if (active && !measureTouched.current && rec.lastMeasure)
          setMeasure(rec.lastMeasure);
      })
      .catch((e) => console.error("Error fetching last measure:", e));
    return () => {
      active = false;
    };
  }, [selectedExercise]);

  const changeMeasure = useCallback((value: SetMeasure) => {
    measureTouched.current = true;
    setMeasure(value);
  }, []);

  // One-shot repeat processing: runs during render once exercises are loaded
  const repeatProcessed = useRef(false);
  if (!loadingExercises && !repeatProcessed.current) {
    repeatProcessed.current = true;
    const shouldRepeat = searchParams.get("repeat") === "true";
    if (shouldRepeat) {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const data = JSON.parse(savedData) as RepeatData;
          const exerciseId = data.exercise?.id || data.exerciseId;
          if (exerciseId) {
            const exToRepeat = exercises.find((ex) => ex.id === exerciseId);
            if (exToRepeat) {
              pendingRepeatMeasure.current = repeatMeasure(data);
              setSelectedExercise(exToRepeat);
            }
          }
          setWeight(data.weight || "");
          setReps(data.reps || "");
          setSeconds(data.durationSec || "");
        } catch (e) {
          console.error("Error loading last set data:", e);
        }
      }
    }
  }

  // Switch unit, converting the current input value to the new unit
  const toggleUnit = useCallback(() => {
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
  }, []);

  // Submit workout set
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedExercise) {
        alert("Por favor selecciona un ejercicio antes de guardar.");
        return;
      }

      setLoading(true);

      // Persist always in kg, regardless of the unit shown in the form
      const weightKg =
        measure === "weight_reps" ? toKg(Number(weight), unit) : null;

      const data =
        measure === "time"
          ? {
              exerciseId: selectedExercise.id,
              reps: 1,
              durationSec: Number(seconds),
              opinion,
            }
          : {
              exerciseId: selectedExercise.id,
              reps: Number(reps),
              weight: weightKg,
              opinion,
              equipmentId,
              isApproximation: measure === "weight_reps" && isApproximation,
            };

      const run = async () => {
        try {
          await api.post(routes.api.workouts.create(), data);
          if (measure !== "time")
            rememberEquipment(selectedExercise.id, equipmentId);

          // Save for "Repeat" flow from Success page (always in kg)
          sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              exerciseId: selectedExercise.id,
              weight: weightKg == null ? "" : String(weightKg),
              reps: measure === "time" ? "1" : reps,
              durationSec: measure === "time" ? seconds : "",
              measure,
            }),
          );

          router.push(routes.success());
        } catch (error) {
          console.error("Error saving workout:", error);
          setLoading(false);
          notifyError("No se pudo guardar el set", run);
        }
      };

      await run();
    },
    [
      selectedExercise,
      measure,
      reps,
      seconds,
      weight,
      unit,
      opinion,
      equipmentId,
      isApproximation,
      router,
    ],
  );

  return {
    weight,
    setWeight,
    unit,
    toggleUnit,
    reps,
    setReps,
    seconds,
    setSeconds,
    opinion,
    setOpinion,
    isApproximation,
    setIsApproximation,
    selectedExercise,
    setSelectedExercise,
    equipmentId,
    setEquipmentId,
    measure,
    changeMeasure,
    loading,
    handleSubmit,
  };
}
