"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackerPage() {
  const params = useParams();
  const router = useRouter();
  const userSlug = params.userSlug as string;

  const [workoutName, setWorkoutName] = useState("");
  const [showPastWorkouts, setShowPastWorkouts] = useState(false);

  // Placeholder data - esto vendrá de Supabase después
  const pastWorkouts = [
    { id: 1, name: "Pecho + Tríceps", date: "Ayer", exercises: 6 },
    { id: 2, name: "Piernas", date: "Hace 2 días", exercises: 5 },
    { id: 3, name: "Espalda + Bíceps", date: "Hace 3 días", exercises: 7 },
  ];

  const handleNewWorkout = () => {
    if (workoutName.trim()) {
      // Por ahora redirige - después guardaremos en Supabase
      router.push(`/${userSlug}/tracker/workout/new`);
    }
  };

  const handleSelectPastWorkout = (workoutId: number) => {
    // Por ahora redirige - después cargaremos datos de Supabase
    router.push(`/${userSlug}/tracker/workout/new`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Link
            href={`/${userSlug}`}
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
          </Link>

          <h1 className="text-lg font-bold tracking-tight">Tracker</h1>

          <div className="w-6" /> {/* Spacer para centrar el título */}
        </div>
      </header>

      {/* Main Content - Flex grow, no scroll */}
      <main className="flex-1 flex flex-col px-6 py-8 overflow-hidden">
        {!showPastWorkouts ? (
          // Nueva rutina view
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Listo para entrenar?
              </h2>
              <p className="text-sm text-muted-foreground">
                Dale un nombre a tu entrenamiento
              </p>
            </div>

            {/* Input - Centered */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md space-y-4">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ej: Pecho + Tríceps"
                  className="w-full px-6 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && workoutName.trim()) {
                      handleNewWorkout();
                    }
                  }}
                />

                <p className="text-xs text-muted-foreground text-center px-4">
                  También puedes dejarlo vacío y empezar directamente
                </p>
              </div>
            </div>

            {/* Actions - Bottom */}
            <div className="shrink-0 space-y-3">
              <button
                onClick={handleNewWorkout}
                className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-98"
              >
                💪 Comenzar Entrenamiento
              </button>

              <button
                onClick={() => setShowPastWorkouts(true)}
                className="w-full py-4 border-2 border-border bg-card text-foreground rounded-2xl font-semibold hover:border-primary hover:bg-primary/5 transition-all active:scale-98"
              >
                📋 Usar Entrenamiento Anterior
              </button>
            </div>
          </>
        ) : (
          // Entrenamientos pasados view
          <>
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Entrenamientos Anteriores
              </h2>
              <p className="text-sm text-muted-foreground">
                Selecciona uno para repetir
              </p>
            </div>

            {/* List - Scrollable section */}
            <div className="flex-1 overflow-y-auto -mx-6 px-6 mb-6">
              <div className="space-y-3 max-w-md mx-auto">
                {pastWorkouts.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => handleSelectPastWorkout(workout.id)}
                    className="w-full p-4 bg-card border-2 border-border rounded-2xl text-left hover:border-primary hover:bg-primary/5 transition-all active:scale-98 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                        {workout.name}
                      </h3>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{workout.date}</span>
                      <span>•</span>
                      <span>{workout.exercises} ejercicios</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Back button - Bottom */}
            <div className="shrink-0">
              <button
                onClick={() => setShowPastWorkouts(false)}
                className="w-full py-4 border-2 border-border bg-card text-foreground rounded-2xl font-semibold hover:border-primary transition-all active:scale-98"
              >
                ← Volver
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}