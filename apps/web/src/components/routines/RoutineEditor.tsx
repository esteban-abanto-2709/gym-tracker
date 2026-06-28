"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Equipment, Routine } from "@/lib/types";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import {
  SortableExerciseItem,
  type DraftItem,
} from "@/components/routines/SortableExerciseItem";
import { Loader2, Plus } from "lucide-react";

interface RoutineEditorProps {
  routineId?: string;
}

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const toNullableInt = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export function RoutineEditor({ routineId }: RoutineEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(routineId);

  const {
    loadingExercises,
    search,
    setSearch,
    filteredExercises,
    createExercise,
    creatingExercise,
  } = useExercises();

  const [name, setName] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [loadingRoutine, setLoadingRoutine] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load routine in edit mode
  useEffect(() => {
    if (!routineId) return;
    const fetchRoutine = async () => {
      try {
        const data = await api.get<Routine>(routes.api.routines.get(routineId));
        setName(data.name);
        setItems(
          data.items.map((item) => ({
            key: newKey(),
            exerciseId: item.exerciseId,
            exerciseName: item.exercise.name,
            equipment: item.exercise.equipment,
            targetSets: item.targetSets?.toString() ?? "",
            targetReps: item.targetReps?.toString() ?? "",
            isApproximation: item.isApproximation ?? false,
          })),
        );
      } catch (e) {
        console.error("Error fetching routine:", e);
      } finally {
        setLoadingRoutine(false);
      }
    };
    fetchRoutine();
  }, [routineId]);

  const addItem = (exercise: {
    id: string;
    name: string;
    equipment: string;
  }) => {
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        equipment: exercise.equipment,
        targetSets: "",
        targetReps: "",
        isApproximation: false,
      },
    ]);
    // Clear the search after the combobox sets it to the picked name
    setTimeout(() => setSearch(""), 0);
  };

  const handleChangeTargets = (
    key: string,
    field: "targetSets" | "targetReps",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleToggleApproximation = (key: string, value: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, isApproximation: value } : item,
      ),
    );
  };

  const handleRemove = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.key === active.id);
      const newIndex = prev.findIndex((i) => i.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleCreateExercise = async (
    exerciseName: string,
    equipment: Equipment,
  ) => {
    try {
      const created = await createExercise(exerciseName, equipment);
      addItem(created);
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Error creating exercise:", e);
    }
  };

  const canSave = name.trim().length > 0 && items.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        items: items.map((item, index) => ({
          exerciseId: item.exerciseId,
          position: index,
          targetSets: toNullableInt(item.targetSets),
          targetReps: toNullableInt(item.targetReps),
          isApproximation: item.isApproximation,
        })),
      };

      if (routineId) {
        await api.patch(routes.api.routines.update(routineId), payload);
      } else {
        await api.post(routes.api.routines.create(), payload);
      }
      router.push(routes.routines());
    } catch (e) {
      console.error("Error saving routine:", e);
      setSaving(false);
    }
  };

  if (loadingRoutine) {
    return (
      <PageShell>
        <AppHeader leftAction={<BackAction href={routes.routines()} />} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {saving && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Guardando...
          </p>
        </div>
      )}

      <AppHeader
        leftAction={<BackAction href={routes.routines()} />}
        title={isEdit ? "Editar Rutina" : "Nueva Rutina"}
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="routine-name"
              className="text-sm font-bold text-foreground ml-1"
            >
              Nombre <span className="text-primary">*</span>
            </label>
            <input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Push Day"
              className="w-full px-4 py-4 text-lg bg-card border-2 border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground font-bold"
              autoComplete="off"
            />
          </div>

          <ExerciseCombobox
            exercises={filteredExercises}
            loadingExercises={loadingExercises}
            selectedExercise={null}
            search={search}
            onSearchChange={setSearch}
            onSelect={addItem}
            onClearSelection={() => setSearch("")}
            onCreateClick={() => setIsDialogOpen(true)}
          />

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <Plus className="w-8 h-8 mb-2 opacity-50" />
              <p className="font-medium">Añade ejercicios a tu rutina</p>
              <p className="text-sm opacity-70">
                Búscalos arriba; arrástralos para ordenarlos.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((item) => (
                    <SortableExerciseItem
                      key={item.key}
                      item={item}
                      onChangeTargets={handleChangeTargets}
                      onToggleApproximation={handleToggleApproximation}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Guardar Cambios" : "Crear Rutina"}
          </button>
        </div>
      </main>

      <CreateExerciseModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialName={search}
        loading={creatingExercise}
        onCreate={handleCreateExercise}
      />
    </PageShell>
  );
}
