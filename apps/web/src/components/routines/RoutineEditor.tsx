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
import { notifyError } from "@/lib/notify";
import type { Exercise, Routine, RoutineBlock } from "@/lib/types";
import { useExercises } from "@/hooks/useExercises";
import { ExerciseCombobox } from "@/components/exercises/ExerciseCombobox";
import { CreateExerciseModal } from "@/components/exercises/CreateExerciseModal";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import {
  SortableExerciseItem,
  type DraftBlock,
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

const emptyBlock = (): DraftBlock => ({
  key: newKey(),
  kind: "weight_reps",
  sets: "",
  reps: "",
  durationSec: "",
  approx: false,
});

const toDraftBlock = (block: RoutineBlock): DraftBlock => ({
  key: newKey(),
  kind: block.kind,
  sets: block.sets?.toString() ?? "",
  reps: ("reps" in block ? block.reps : null)?.toString() ?? "",
  durationSec:
    ("durationSec" in block ? block.durationSec : null)?.toString() ?? "",
  approx: "approx" in block ? block.approx : false,
});

const toBlock = (block: DraftBlock, isTimed: boolean): RoutineBlock => {
  const sets = toNullableInt(block.sets);
  const reps = toNullableInt(block.reps);
  const durationSec = toNullableInt(block.durationSec);
  switch (block.kind) {
    case "legacy":
      return {
        kind: "legacy",
        sets,
        reps: isTimed ? null : reps,
        durationSec: isTimed ? durationSec : null,
        approx: isTimed ? false : block.approx,
      };
    case "weight_reps":
      return { kind: "weight_reps", sets, reps, approx: block.approx };
    case "reps":
      return { kind: "reps", sets, reps };
    case "time":
      return { kind: "time", sets, durationSec };
    case "warmup":
      return { kind: "warmup", sets, reps };
  }
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
            isTimed: item.exercise.isTimed ?? false,
            blocks: item.blocks.map(toDraftBlock),
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

  const addItem = (exercise: Exercise) => {
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        isTimed: exercise.isTimed ?? false,
        blocks: [emptyBlock()],
      },
    ]);
    // Clear the search after the combobox sets it to the picked name
    setTimeout(() => setSearch(""), 0);
  };

  const updateBlocks = (
    itemKey: string,
    update: (blocks: DraftBlock[]) => DraftBlock[],
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === itemKey ? { ...item, blocks: update(item.blocks) } : item,
      ),
    );
  };

  const handleChangeBlock = (
    itemKey: string,
    blockKey: string,
    patch: Partial<DraftBlock>,
  ) =>
    updateBlocks(itemKey, (blocks) =>
      blocks.map((block) =>
        block.key === blockKey ? { ...block, ...patch } : block,
      ),
    );

  const handleAddBlock = (itemKey: string) =>
    updateBlocks(itemKey, (blocks) => [...blocks, emptyBlock()]);

  const handleRemoveBlock = (itemKey: string, blockKey: string) =>
    updateBlocks(itemKey, (blocks) =>
      blocks.filter((block) => block.key !== blockKey),
    );

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
    isTimed: boolean,
  ) => {
    try {
      const created = await createExercise(exerciseName, isTimed);
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
    const payload = {
      name: name.trim(),
      items: items.map((item, index) => ({
        exerciseId: item.exerciseId,
        position: index,
        blocks: item.blocks.map((block) => toBlock(block, item.isTimed)),
      })),
    };

    const run = async () => {
      try {
        if (routineId) {
          await api.patch(routes.api.routines.update(routineId), payload);
        } else {
          await api.post(routes.api.routines.create(), payload);
        }
        router.push(routes.routines());
      } catch (e) {
        console.error("Error saving routine:", e);
        setSaving(false);
        notifyError("No se pudo guardar la rutina", run);
      }
    };

    await run();
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
              className="kicker text-muted-foreground text-[0.65rem]"
            >
              Nombre de la rutina
            </label>
            <input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Torso A"
              className="w-full bg-transparent border-b-2 border-input focus:border-primary text-foreground font-display font-bold uppercase text-4xl tracking-tight px-0 py-2 outline-none transition-colors placeholder:text-muted-foreground/40"
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

          <p className="kicker text-muted-foreground text-[0.65rem]">
            Ejercicios · {items.length}
          </p>

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
                  {items.map((item, index) => (
                    <SortableExerciseItem
                      key={item.key}
                      index={index}
                      item={item}
                      onChangeBlock={handleChangeBlock}
                      onAddBlock={handleAddBlock}
                      onRemoveBlock={handleRemoveBlock}
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
            className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
