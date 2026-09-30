"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { Program, Routine } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { ClipboardList, Loader2, Trash2 } from "lucide-react";

interface ProgramEditorProps {
  programId?: string;
}

export function ProgramEditor({ programId }: ProgramEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(programId);

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routineList, programList] = await Promise.all([
          api.get<Routine[]>(routes.api.routines.list()),
          api.get<Program[]>(routes.api.programs.list()),
        ]);
        setRoutines(routineList);
        setPrograms(programList);
        const current = programList.find((p) => p.id === programId);
        if (current) {
          setName(current.name);
          setSelected(current.routines.map((r) => r.id));
        }
      } catch (e) {
        console.error("Error fetching program data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [programId]);

  const programNames = new Map(programs.map((p) => [p.id, p.name]));
  const routineNames = new Map(routines.map((r) => [r.id, r.name]));
  const duplicateName = programs.some(
    (p) => p.id !== programId && p.name === name.trim(),
  );
  const canSave =
    name.trim().length > 0 && selected.length > 0 && !duplicateName && !saving;

  const toggle = (routineId: string) =>
    setSelected((prev) =>
      prev.includes(routineId)
        ? prev.filter((id) => id !== routineId)
        : [...prev, routineId],
    );

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = { name: name.trim(), routineIds: selected };

    const run = async () => {
      try {
        if (programId) {
          await api.patch(routes.api.programs.update(programId), payload);
        } else {
          await api.post(routes.api.programs.create(), payload);
        }
        router.push(routes.programs());
      } catch (e) {
        console.error("Error saving program:", e);
        setSaving(false);
        notifyError("No se pudo guardar el programa", run);
      }
    };

    await run();
  };

  const handleDelete = async () => {
    if (
      !programId ||
      !window.confirm(`¿Eliminar "${name}"? Tus rutinas no se borran.`)
    ) {
      return;
    }
    setSaving(true);
    try {
      await api.delete(routes.api.programs.delete(programId));
      router.push(routes.programs());
    } catch (e) {
      console.error("Error deleting program:", e);
      setSaving(false);
      notifyError("No se pudo eliminar el programa");
    }
  };

  if (loading) {
    return (
      <PageShell>
        <AppHeader leftAction={<BackAction href={routes.programs()} />} />
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
        leftAction={<BackAction href={routes.programs()} />}
        title={isEdit ? "Editar Programa" : "Nuevo Programa"}
        rightAction={
          isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Eliminar programa"
              aria-label="Eliminar programa"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="program-name"
              className="kicker text-muted-foreground text-[0.65rem]"
            >
              Nombre del programa
            </label>
            <input
              id="program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Upper/Lower"
              className="w-full bg-transparent border-b-2 border-input focus:border-primary text-foreground font-display font-bold uppercase text-4xl tracking-tight px-0 py-2 outline-none transition-colors placeholder:text-muted-foreground/40"
              autoComplete="off"
            />
            {duplicateName && (
              <p className="text-sm text-destructive">
                Ya tienes un programa con ese nombre.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="kicker text-muted-foreground text-[0.65rem]">
              Rotación · {selected.length}
            </p>
            <p className="text-sm text-foreground min-h-5">
              {selected.length > 0
                ? selected.map((id) => routineNames.get(id)).join(" → ")
                : "Toca tus rutinas en el orden en que las haces."}
            </p>
          </div>

          {routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <ClipboardList className="w-8 h-8 mb-2 opacity-50" />
              <p className="font-medium">Aún no tienes rutinas</p>
              <p className="text-sm opacity-70">
                Crea tus rutinas primero y luego agrúpalas aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {routines.map((routine) => {
                const order = selected.indexOf(routine.id);
                const isSelected = order !== -1;
                const otherProgram =
                  routine.programId && routine.programId !== programId
                    ? programNames.get(routine.programId)
                    : undefined;
                return (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => toggle(routine.id)}
                    aria-pressed={isSelected}
                    className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:border-border"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center font-display text-lg ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isSelected ? order + 1 : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-foreground truncate">
                        {routine.name}
                      </span>
                      {otherProgram && (
                        <span className="block text-xs text-muted-foreground truncate">
                          {isSelected
                            ? `Se mueve desde ${otherProgram}`
                            : `En ${otherProgram}`}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? "Guardar Cambios" : "Crear Programa"}
          </button>
        </div>
      </main>
    </PageShell>
  );
}
