"use client";

import { useState } from "react";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import type { Equipment, Exercise } from "@/lib/types";
import { X } from "lucide-react";

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (name: string, equipment: Equipment) => {
    try {
      const created = await createExercise(name, equipment);
      setIsCreateOpen(false);
      onPick(created);
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Agregar ejercicio</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
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
