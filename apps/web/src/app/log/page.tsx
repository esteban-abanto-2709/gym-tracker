"use client";

import { useState, Suspense } from "react";
import { useExercises } from "@/hooks/useExercises";
import { useEquipment } from "@/hooks/useEquipment";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { PageShell } from "@/components/layout/PageShell";
import {
  AppHeader,
  BackAction,
  HistoryAction,
} from "@/components/layout/AppHeader";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { ApproximationToggle } from "@/components/ApproximationToggle";
import { routes } from "@/lib/routes";
import { convertWeight } from "@/lib/units";
import { Loader2 } from "lucide-react";

function LogContent() {
  // --- Hooks de negocio ---
  const {
    exercises,
    loadingExercises,
    search,
    setSearch,
    filteredExercises,
    createExercise,
    creatingExercise,
  } = useExercises();

  const {
    weight,
    setWeight,
    unit,
    toggleUnit,
    reps,
    setReps,
    opinion,
    setOpinion,
    isApproximation,
    setIsApproximation,
    selectedExercise,
    setSelectedExercise,
    equipmentId,
    setEquipmentId,
    loading,
    handleSubmit,
  } = useWorkoutForm(exercises, loadingExercises);

  const { equipment } = useEquipment();

  // --- Modal state ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Create exercise via hook + select it
  const handleCreate = async (name: string) => {
    try {
      const created = await createExercise(name);
      setSelectedExercise(created);
      setSearch(created.name);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  return (
    <PageShell>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Guardando...
          </p>
        </div>
      )}

      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        rightAction={<HistoryAction />}
      />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-visible relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto mb-6">
          <ContinueRoutineBanner />
        </div>
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

          {/* Exercise Selector */}
          <ExerciseCombobox
            exercises={filteredExercises}
            loadingExercises={loadingExercises}
            selectedExercise={selectedExercise}
            search={search}
            onSearchChange={setSearch}
            onSelect={setSelectedExercise}
            onClearSelection={() => setSelectedExercise(null)}
            onCreateClick={() => setIsDialogOpen(true)}
          />

          {/* Equipo (aparece al elegir ejercicio; default = tu último uso) */}
          {selectedExercise && (
            <EquipmentSelector
              equipment={equipment}
              value={equipmentId}
              onChange={setEquipmentId}
            />
          )}

          {/* Peso y Reps en una fila */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Peso ({unit}) <span className="text-primary">*</span>
                </label>
                <button
                  type="button"
                  onClick={toggleUnit}
                  className="flex items-center text-[10px] font-bold rounded-full border border-input overflow-hidden"
                  aria-label="Cambiar unidad de peso"
                >
                  <span
                    className={`px-2 py-0.5 transition-colors ${
                      unit === "kg"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    kg
                  </span>
                  <span
                    className={`px-2 py-0.5 transition-colors ${
                      unit === "lb"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    lb
                  </span>
                </button>
              </div>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.5"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.2s]"
                required
                autoComplete="off"
                data-1p-ignore
              />
              {weight !== "" && !Number.isNaN(Number(weight)) && (
                <p className="text-xs text-muted-foreground text-center font-mono">
                  ≈{" "}
                  {convertWeight(
                    Number(weight),
                    unit,
                    unit === "kg" ? "lb" : "kg",
                  )}{" "}
                  {unit === "kg" ? "lb" : "kg"}
                </p>
              )}
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
              rows={3}
              className="w-full px-4 py-3 text-base bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground resize-none animate-slide-in-right [animation-delay:0.5s]"
            />
          </div>

          <ApproximationToggle
            checked={isApproximation}
            onChange={setIsApproximation}
            className="px-1"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedExercise}
            className="group relative w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden animate-scale-in [animation-delay:0.6s]"
          >
            ✓ Registrar Set
            <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4 opacity-70">
            Se guardará automáticamente con fecha y hora
          </p>
        </form>
      </main>

      {/* Create Exercise Modal */}
      <CreateExerciseModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialName={search}
        loading={creatingExercise}
        onCreate={handleCreate}
      />
    </PageShell>
  );
}

export default function LogPage() {
  return (
    <Suspense>
      <LogContent />
    </Suspense>
  );
}
