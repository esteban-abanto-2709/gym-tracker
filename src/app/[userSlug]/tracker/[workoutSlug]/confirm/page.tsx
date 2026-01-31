"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { routes } from "@/lib/routes";

interface ExerciseData {
  name: string;
  weight: string;
  reps: string;
  notes?: string;
}

export default function WorkoutConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const userSlug = params.userSlug as string;
  const workoutSlug = params.workoutSlug as string;

  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);

  useEffect(() => {
    // Cargar datos desde sessionStorage
    const savedData = sessionStorage.getItem(`workout-${workoutSlug}-confirm`);

    if (savedData) {
      try {
        const data: ExerciseData = JSON.parse(savedData);
        setExerciseData(data);

        // Limpiar el sessionStorage después de cargar
        sessionStorage.removeItem(`workout-${workoutSlug}-confirm`);

        // TODO: Aquí es donde guardaríamos en Supabase
        // await saveExerciseToSupabase(workoutSlug, data);
      } catch (e) {
        console.error("Error loading exercise data:", e);
        // Si no hay datos, redirigir de vuelta
        router.push(routes.workout(userSlug, workoutSlug));
      }
    } else {
      // No hay datos, redirigir
      router.push(routes.workout(userSlug, workoutSlug));
    }
  }, [workoutSlug, userSlug, router]);

  const handleNewSet = () => {
    if (!exerciseData) return;

    // Guardar datos del ejercicio actual para autocompletar
    sessionStorage.setItem(
      `workout-${workoutSlug}-lastExercise`,
      JSON.stringify(exerciseData),
    );

    // Volver al formulario (que se autocompletará)
    router.push(routes.workout(userSlug, workoutSlug));
  };

  const handleNewExercise = () => {
    // Simplemente volver al formulario sin datos (formulario limpio)
    router.push(routes.workout(userSlug, workoutSlug));
  };

  // Mientras carga o si no hay datos
  if (!exerciseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-bold tracking-tight">Registrado ✓</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8">
        {/* Success Message */}
        <div className="mb-8 animate-scale-in">
          <div className="max-w-md mx-auto p-6 bg-success/10 border-2 border-success/30 rounded-3xl">
            <div className="text-center">
              {/* Check Icon */}
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-10 h-10 text-success-foreground"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>

              {/* Exercise Details */}
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                {exerciseData.name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-lg font-semibold text-foreground/80">
                <span>{exerciseData.weight} kg</span>
                <span className="text-muted-foreground">×</span>
                <span>{exerciseData.reps} reps</span>
              </div>

              {exerciseData.notes && (
                <p className="mt-3 text-sm text-muted-foreground italic">
                  &quot;{exerciseData.notes}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Actions Section */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold mb-1">¿Qué sigue?</h3>
            <p className="text-sm text-muted-foreground">
              Continúa tu entrenamiento
            </p>
          </div>

          {/* Nueva Serie - Primary Action */}
          <button
            onClick={handleNewSet}
            className="w-full py-5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-98 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">↻</span>
            <span>Nueva Serie</span>
            <span className="text-sm opacity-80 font-normal">
              (mismo ejercicio)
            </span>
          </button>

          {/* Otro Ejercicio - Secondary Action */}
          <button
            onClick={handleNewExercise}
            className="w-full py-5 border-2 border-border bg-card text-foreground rounded-2xl font-semibold text-lg hover:border-primary hover:bg-primary/5 transition-all active:scale-98 flex flex-col items-center gap-1"
          >
            <span className="text-2xl">➕</span>
            <span>Otro Ejercicio</span>
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4 pt-2">
            Cierra la app cuando termines de entrenar
          </p>
        </div>
      </main>
    </div>
  );
}
