"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const userSlug = params.userSlug as string;
  const workoutSlug = params.workoutSlug as string;

  const [exerciseName, setExerciseName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseName.trim() || !weight || !reps) {
      return;
    }

    setIsSubmitting(true);

    // TODO: Guardar en Supabase
    // await supabase.from('workout_sets').insert({...})

    // Simular guardado
    setTimeout(() => {
      router.push(`/${userSlug}/tracker/${workoutSlug}/next?exercise=${encodeURIComponent(exerciseName)}&weight=${weight}&reps=${reps}`);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors active:scale-95"
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
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex flex-col px-6 py-6 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* Form Fields - Centered */}
          <div className="flex-1 flex flex-col justify-center space-y-5 max-w-md mx-auto w-full">
            {/* Nombre del Ejercicio */}
            <div>
              <label htmlFor="exercise-name" className="block text-sm font-medium text-muted-foreground mb-2 px-1">
                Nombre del ejercicio
              </label>
              <input
                id="exercise-name"
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="Press de Banca"
                className="w-full px-5 py-4 text-lg bg-card border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground font-medium"
                autoFocus
                required
              />
            </div>

            {/* Peso */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-muted-foreground mb-2 px-1">
                Peso (kg)
              </label>
              <input
                id="weight"
                type="number"
                inputMode="decimal"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-5 py-4 text-lg bg-card border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground font-medium"
                required
              />
            </div>

            {/* Repeticiones */}
            <div>
              <label htmlFor="reps" className="block text-sm font-medium text-muted-foreground mb-2 px-1">
                Repeticiones
              </label>
              <input
                id="reps"
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="12"
                className="w-full px-5 py-4 text-lg bg-card border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground font-medium"
                required
              />
            </div>

            {/* Comentario (Opcional) */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-muted-foreground mb-2 px-1">
                Comentario (opcional)
              </label>
              <input
                id="comment"
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Me dolió el hombro..."
                className="w-full px-5 py-4 text-base bg-card border-2 border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Submit Button - Bottom */}
          <div className="shrink-0 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !exerciseName.trim() || !weight || !reps}
              className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? "Guardando..." : "Registrar"}
            </button>

            {/* Hint */}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Se guardará automáticamente con fecha y hora
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}