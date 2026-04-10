import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Exercise } from "@/lib/types";

const STORAGE_KEY = "gymtrack-last-set";

interface RepeatData {
  exercise?: Exercise | null;
  exerciseId?: string;
  weight: string;
  reps: string;
}

export function useWorkoutForm(
  exercises: Exercise[],
  loadingExercises: boolean,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [opinion, setOpinion] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

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
              setSelectedExercise(exToRepeat);
            }
          }
          setWeight(data.weight || "");
          setReps(data.reps || "");
        } catch (e) {
          console.error("Error loading last set data:", e);
        }
      }
    }
  }

  // Submit workout set
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedExercise) {
        alert("Por favor selecciona un ejercicio antes de guardar.");
        return;
      }

      setLoading(true);

      const data = {
        exerciseId: selectedExercise.id,
        reps: Number(reps),
        weight: Number(weight),
        opinion,
      };

      try {
        await api.post(routes.api.workouts.create(), data);

        // Save for "Repeat" flow from Success page
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            exerciseId: selectedExercise.id,
            weight,
            reps,
          }),
        );

        router.push(routes.success());
      } catch (error) {
        console.error("Error saving workout:", error);
        setLoading(false);
      }
    },
    [selectedExercise, reps, weight, opinion, router],
  );

  return {
    weight,
    setWeight,
    reps,
    setReps,
    opinion,
    setOpinion,
    selectedExercise,
    setSelectedExercise,
    loading,
    handleSubmit,
  };
}
