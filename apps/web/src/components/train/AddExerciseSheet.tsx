"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import type { Exercise } from "@/lib/types";
import { X } from "lucide-react";
import { heading } from "@/components/base/heading";

interface AddExerciseSheetProps {
  onPick: (exercise: Exercise) => void;
  onClose: () => void;
}

export function AddExerciseSheet({ onPick, onClose }: AddExerciseSheetProps) {
  const {
    loadingExercises,
    search,
    setSearch,
    filteredExercises,
    createExercise,
    creatingExercise,
  } = useExercises();

  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (name: string) => {
    try {
      const created = await createExercise(name);
      setIsCreateOpen(false);
      onPick(created);
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="shrink-0 px-6 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-border flex items-center justify-between">
        <h2 className={heading({ size: "sm", className: "text-foreground" })}>
          {t("train.map.addExercise")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("common.close")}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto">
        <div className="max-w-md mx-auto">
          <ExerciseCombobox
            exercises={filteredExercises}
            loadingExercises={loadingExercises}
            selectedExercise={null}
            search={search}
            onSearchChange={setSearch}
            onSelect={onPick}
            onClearSelection={() => setSearch("")}
            onCreateClick={() => setIsCreateOpen(true)}
          />
        </div>
      </div>

      <CreateExerciseModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialName={search}
        loading={creatingExercise}
        onCreate={handleCreate}
      />
    </div>
  );
}
