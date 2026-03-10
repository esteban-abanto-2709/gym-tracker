"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      exercise: formData.get("exercise-name"),
      description: formData.get("description"),
      reps: Number(formData.get("reps")),
      weight: Number(formData.get("weight")),
      opinion: formData.get("opinion"),
    };

    try {
      await api.post(routes.api.workouts.create(), data);
      router.push(routes.success());
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 dark:bg-black font-sans">
      <main className="mx-auto max-w-lg space-y-6">
        <header className="mb-8 text-center pt-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Registrar Entrenamiento
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Completa los detalles de tu set.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          suppressHydrationWarning
        >
          {/* Nombre del Ejercicio */}
          <Card className="border-none shadow-sm text-black">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label
                  htmlFor="exercise-name"
                  className="text-base font-medium"
                >
                  Nombre del ejercicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exercise-name"
                  name="exercise-name"
                  placeholder="Texto de respuesta breve"
                  className="border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all shadow-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Descripción del Ejercicio */}
          <Card className="border-none shadow-sm text-black">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-medium">
                  Descripción del ejercicio
                </Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Texto de respuesta breve"
                  className="border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all shadow-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Repeticiones y Peso (Unificados) */}
          <Card className="border-none shadow-sm text-black">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="reps" className="text-base font-medium">
                    Repeticiones <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reps"
                    name="reps"
                    type="number"
                    placeholder="Ejem: 12"
                    className="border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all shadow-none"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="weight" className="text-base font-medium">
                    Peso (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.5"
                    placeholder="Ejem: 60"
                    className="border-0 border-b border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary transition-all shadow-none"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opinión */}
          <Card className="border-none shadow-sm text-black">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label htmlFor="opinion" className="text-base font-medium">
                  Opinión del set
                </Label>
                <Textarea
                  id="opinion"
                  name="opinion"
                  placeholder="Cuéntanos cómo te sentiste..."
                  className="min-h-[100px] border-zinc-200 focus-visible:ring-primary h-24"
                />
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-zinc-900 text-zinc-50 rounded-xl font-semibold hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
              suppressHydrationWarning
            >
              {loading ? "Guardando..." : "Guardar Set"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
