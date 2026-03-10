"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Form State
  const [exercise, setExercise] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [opinion, setOpinion] = useState("");

  // Load last set if "repeat" param is present
  useEffect(() => {
    const shouldRepeat = searchParams.get("repeat") === "true";
    if (shouldRepeat) {
      const savedData = sessionStorage.getItem("gymtrack-last-set");
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setExercise(data.exercise || "");
          setDescription(data.description || "");
          setWeight(data.weight || "");
          setReps(data.reps || "");
          // Opinion is NOT repeated as per user request (only 4 "most important" fields)
        } catch (e) {
          console.error("Error loading last set data:", e);
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      exercise,
      description,
      reps: Number(reps),
      weight: Number(weight),
      opinion,
    };

    try {
      // Save for "Repeat" feature
      sessionStorage.setItem("gymtrack-last-set", JSON.stringify({
        exercise,
        description,
        weight,
        reps,
      }));

      await api.post(routes.api.workouts.create(), data);
      router.push(routes.success());
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--foreground) 35px,
              var(--foreground) 36px
            )`,
          }}
        />
      </div>

      {/* Gradient Orb */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
        }}
      />

      {/* Header - Fixed */}
      <header className="shrink-0 px-6 py-4 border-b border-border relative z-10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="w-6" />{" "}
          {/* Spacer for symmetry if there's no back button */}
          <h1 className="text-xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
              GYM
            </span>
            <span className="text-foreground">TRACK</span>
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10 animate-fade-in-up">
        <form 
          onSubmit={handleSubmit} 
          className="max-w-md mx-auto space-y-6"
          autoComplete="off"
        >
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground">
              Registrar Entrenamiento
            </h2>
            <p className="text-sm text-muted-foreground">
              Completa los detalles de tu set
            </p>
          </div>

          {/* Nombre del Ejercicio */}
          <div className="space-y-2">
            <label
              htmlFor="exercise-name"
              className="block text-sm font-medium text-muted-foreground"
            >
              Ejercicio <span className="text-primary">*</span>
            </label>
            <input
              id="exercise-name"
              name="exercise-name"
              type="text"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="Ej: Press de Banca"
              className="w-full px-6 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground animate-slide-in-right [animation-delay:0.1s]"
              required
              autoFocus
              autoComplete="off"
              data-1p-ignore
            />
          </div>

          {/* Descripción / Notas */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-muted-foreground"
            >
              Descripción del ejercicio
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional: Detalles técnicos"
              className="w-full px-6 py-4 text-base bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground animate-slide-in-right [animation-delay:0.4s]"
            />
          </div>

          {/* Peso y Reps en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-muted-foreground"
              >
                Peso (kg) <span className="text-primary">*</span>
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.5"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.2s]"
                required
                autoComplete="off"
                data-1p-ignore
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-muted-foreground"
              >
                Repeticiones <span className="text-primary">*</span>
              </label>
              <input
                id="reps"
                name="reps"
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="12"
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.3s]"
                required
                autoComplete="off"
                data-1p-ignore
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="opinion"
              className="block text-sm font-medium text-muted-foreground"
            >
              ¿Cómo te sentiste?
            </label>
            <textarea
              id="opinion"
              name="opinion"
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="Ej: Me sentí con buena energía hoy"
              rows={3}
              className="w-full px-4 py-3 text-base bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground resize-none animate-slide-in-right [animation-delay:0.5s]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden animate-scale-in [animation-delay:0.6s]"
          >
            <span className="relative z-10">
              {loading ? "Guardando..." : "✓ Registrar Set"}
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4 opacity-70">
            Se guardará automáticamente con fecha y hora
          </p>
        </form>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
