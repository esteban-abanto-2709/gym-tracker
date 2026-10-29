"use client";

import { useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useExercises } from "@/hooks/useExercises";
import { useEquipment } from "@/hooks/useEquipment";
import { useWorkoutForm } from "@/hooks/useWorkoutForm";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { EquipmentSelector } from "@/components/equipment/EquipmentSelector";
import { DurationField } from "@/components/DurationPicker";
import { MeasureSelector } from "@/components/MeasureSelector";
import { UnitToggle } from "@/components/UnitToggle";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { routes } from "@/lib/routes";
import { convertWeight } from "@/lib/units";
import { Check } from "lucide-react";
import { Button } from "@/components/base/button";
import { LoadingOverlay } from "@/components/base/spinner";
import { cn } from "@/lib/utils";
import { surfaceClass } from "@/components/base/surface";

function LogContent() {
  const t = useTranslations("log");
  const tCommon = useTranslations("common");
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
    seconds,
    setSeconds,
    selectedExercise,
    setSelectedExercise,
    equipmentId,
    setEquipmentId,
    measure,
    changeMeasure,
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
      {loading && <LoadingOverlay label={tCommon("saving")} />}

      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title={t("title")}
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
          <p className="kicker text-primary text-2xs mb-2">{t("kicker")}</p>

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

          {selectedExercise && (
            <MeasureSelector value={measure} onChange={changeMeasure} />
          )}

          {selectedExercise && measure !== "time" && (
            <EquipmentSelector
              equipment={equipment}
              value={equipmentId}
              onChange={setEquipmentId}
            />
          )}

          {measure === "time" ? (
            <div className="space-y-2">
              <label className="kicker text-muted-foreground text-3xs">
                {t("time")} <span className="text-primary">*</span>
              </label>
              <DurationField
                value={seconds}
                onChange={setSeconds}
                label={t("time")}
              />
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4",
                measure === "weight_reps" ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {measure === "weight_reps" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="weight"
                      className="kicker text-muted-foreground text-3xs"
                    >
                      {t("weight", { unit })}{" "}
                      <span className="text-primary">*</span>
                    </label>
                    <UnitToggle unit={unit} onToggle={toggleUnit} />
                  </div>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className={cn(
                      surfaceClass,
                      "w-full px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.2s]",
                    )}
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
              )}

              <div className="space-y-2">
                <label
                  htmlFor="reps"
                  className="kicker text-muted-foreground text-3xs"
                >
                  {t("reps")} <span className="text-primary">*</span>
                </label>
                <input
                  id="reps"
                  name="reps"
                  type="number"
                  inputMode="numeric"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className={cn(
                    surfaceClass,
                    "w-full px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground text-center font-mono animate-slide-in-right [animation-delay:0.3s]",
                  )}
                  required
                  autoComplete="off"
                  data-1p-ignore
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              loading ||
              !selectedExercise ||
              (measure === "time" && !(Number(seconds) > 0))
            }
            className="group relative hover:shadow-xl hover:shadow-primary/30 overflow-hidden animate-scale-in [animation-delay:0.6s] flex"
          >
            <Check className="w-6 h-6" strokeWidth={3} />
            {t("submit")}
            <div className="absolute inset-0 bg-linear-to-r from-brand-end to-brand-start opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center px-4 opacity-70">
            {t("hint")}
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
