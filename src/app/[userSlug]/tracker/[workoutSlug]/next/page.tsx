"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NextPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userSlug = params.userSlug as string;
  const workoutSlug = params.workoutSlug as string;

  // Obtener datos del último set registrado
  const exercise = searchParams.get('exercise') || '';
  const weight = searchParams.get('weight') || '';
  const reps = searchParams.get('reps') || '';

  const [isNavigating, setIsNavigating] = useState(false);

  const handleNewSet = () => {
    setIsNavigating(true);
    // Pre-llenar con los datos del último set
    router.push(
      `/${userSlug}/tracker/${workoutSlug}/repeat?` +
      `exercise=${encodeURIComponent(exercise)}` +
      `&weight=${weight}` +
      `&reps=${reps}`
    );
  };

  const handleNewExercise = () => {
    setIsNavigating(true);
    // Formulario vacío
    router.push(`/${userSlug}/tracker/${workoutSlug}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/${userSlug}/tracker`)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h1 className="text-lg font-bold tracking-tight">Entrenamiento</h1>

          <div className="w-6" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 py-8 overflow-hidden">
        {/* Success Message - Top */}
        <div className="shrink-0 mb-8">
          <div className="bg-linear-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30 rounded-2xl p-6 animate-scale-in">
            {/* Checkmark Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
            </div>

            {/* Exercise Info */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                ¡Serie registrada!
              </h2>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {exercise}
                </p>
                <p className="text-3xl font-bold bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
                  {weight} kg × {reps} reps
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for vertical centering */}
        <div className="flex-1" />

        {/* Question */}
        <div className="shrink-0 text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            ¿Qué sigue?
          </h3>
          <p className="text-sm text-muted-foreground">
            Elige tu próxima acción
          </p>
        </div>

        {/* Action Buttons - Bottom */}
        <div className="shrink-0 space-y-3">
          {/* Nueva Serie - Primary */}
          <button
            onClick={handleNewSet}
            disabled={isNavigating}
            className="group w-full p-5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Nueva Serie</p>
                  <p className="text-sm opacity-90">Mismo ejercicio</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </button>

          {/* Otro Ejercicio - Secondary */}
          <button
            onClick={handleNewExercise}
            disabled={isNavigating}
            className="group w-full p-5 bg-card border-2 border-border text-foreground rounded-2xl hover:border-primary hover:bg-primary/5 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Otro Ejercicio</p>
                  <p className="text-sm text-muted-foreground">Cambiar de ejercicio</p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Cierra la app cuando termines de entrenar
          </p>
        </div>
      </main>
    </div>
  );
}