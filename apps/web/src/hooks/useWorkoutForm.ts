import { useState, useCallback, useEffect } from "react";
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

function readRepeatData(): RepeatData | null {
  const savedData = sessionStorage.getItem(STORAGE_KEY);
  if (!savedData) return null;
  try {
    return JSON.parse(savedData) as RepeatData;
  } catch (e) {
    console.error("Error loading last set data:", e);
    return null;
  }
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
  const [selectedExercise, setSelectedExerciseState] =
    useState<Exercise | null>(null);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [measure, setMeasure] = useState<SetMeasure>("weight_reps");
  const [measureLocked, setMeasureLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repeatChecked, setRepeatChecked] = useState(false);

  const selectExercise = useCallback(
    (exercise: Exercise | null, repeatedMeasure?: SetMeasure) => {
      if (exercise === selectedExercise) return;
      setSelectedExerciseState(exercise);
      setEquipmentId(exercise ? getLastEquipment(exercise.id) : null);
      setMeasure(repeatedMeasure ?? "weight_reps");
      setMeasureLocked(repeatedMeasure != null);
    },
    [selectedExercise],
  );

  const setSelectedExercise = useCallback(
    (exercise: Exercise | null) => selectExercise(exercise),
    [selectExercise],
  );

  useEffect(() => {
    if (!selectedExercise || measureLocked) return;

    let active = true;
    api
      .get<{ lastMeasure: SetMeasure | null }>(
        routes.api.workouts.recommendation(
          selectedExercise.id,
          null,
        ),
      )
      .then((rec) => {
        if (active && rec.lastMeasure) setMeasure(rec.lastMeasure);
      })
      .catch((e) => console.error("Error fetching last measure:", e));
    return () => {
      active = false;
    };
  }, [selectedExercise, measureLocked]);

  const changeMeasure = useCallback((value: SetMeasure) => {
    setMeasureLocked(true);
    setMeasure(value);
  }, []);

  if (!loadingExercises && !repeatChecked) {
    setRepeatChecked(true);
    const data =
      searchParams.get("repeat") === "true" ? readRepeatData() : null;
    if (data) {
      const exerciseId = data.exercise?.id || data.exerciseId;
      const exToRepeat = exercises.find((ex) => ex.id === exerciseId);
      if (exToRepeat) selectExercise(exToRepeat, repeatMeasure(data));
      setWeight(data.weight || "");
      setReps(data.reps || "");
      setSeconds(data.durationSec || "");
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
