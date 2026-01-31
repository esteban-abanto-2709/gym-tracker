"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { routes } from "@/lib/routes";

// Tipos para el estado del workout
interface ExerciseData {
  name: string;
  weight: string;
  reps: string;
  notes?: string;
}

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userSlug = params.userSlug as string;
  const workoutSlug = params.workoutSlug as string;

  // Estado del formulario
  const [exerciseName, setExerciseName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");

  // Cargar datos de autocompletado si existen
  useEffect(() => {
    // Intentar cargar desde sessionStorage
    const savedData = sessionStorage.getItem(`workout-${workoutSlug}-lastExercise`);
    if (savedData) {
      try {
        const data: ExerciseData = JSON.parse(savedData);
        setExerciseName(data.name);
        setWeight(data.weight);
        setReps(data.reps);
        setNotes(data.notes || "");

        // Limpiar después de cargar
        sessionStorage.removeItem(`workout-${workoutSlug}-lastExercise`);
      } catch (e) {
        console.error("Error loading exercise data:", e);
      }
    }
  }, [workoutSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseName.trim() || !weight.trim() || !reps.trim()) {
      return;
    }

    // Guardar datos en sessionStorage para la página de confirmación
    const exerciseData: ExerciseData = {
      name: exerciseName,
      weight,
      reps,
      notes: notes.trim() || undefined,
    };

    sessionStorage.setItem(`workout-${workoutSlug}-confirm`, JSON.stringify(exerciseData));

    // Ir a la página de confirmación
    router.push(routes.workoutConfirm(userSlug, workoutSlug));
  };

  const handleBack = () => {
    router.push(routes.tracker(userSlug));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <h1 className="text-lg font-bold tracking-tight">Registrar Ejercicio</h1>

          <div className="w-6" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Nombre del Ejercicio */}
          <div className="space-y-2">
            <label htmlFor="exercise-name" className="block text-sm font-medium text-muted-foreground">
              Ejercicio
            </label>
            <input
              id="exercise-name"
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ej: Press de Banca"
              className="w-full px-6 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
              autoFocus
              required
            />
          </div>

          {/* Peso y Reps en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="weight" className="block text-sm font-medium text-muted-foreground">
                Peso (kg)
              </label>
              <input
                id="weight"
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reps" className="block text-sm font-medium text-muted-foreground">
                Repeticiones
              </label>
              <input
                id="reps"
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="12"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono"
                required
              />
            </div>
          </div>

          {/* Notas (opcional) */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">
              Comentario (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Me sentí con buena energía hoy"
              rows={3}
              className="w-full px-4 py-3 text-base bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!exerciseName.trim() || !weight.trim() || !reps.trim()}
          >
            ✓ Registrar
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4">
            Se guardará automáticamente con fecha y hora
          </p>
        </form>
      </main>
    </div>
  );
}