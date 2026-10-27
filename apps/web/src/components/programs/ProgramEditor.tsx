"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { programsQuery, refetchAll, routinesQuery } from "@/lib/queries";
import type { Program, Routine } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { ClipboardList, Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/base/button";
import { LoadingOverlay, Spinner } from "@/components/base/spinner";
import { cn } from "@/lib/utils";
import { heading } from "@/components/base/heading";

const NONE_ROUTINES: Routine[] = [];
const NONE_PROGRAMS: Program[] = [];

interface ProgramEditorProps {
  programId?: string;
}

export function ProgramEditor({ programId }: ProgramEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(programId);

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const routinesList = useQuery(routinesQuery);
  const programsList = useQuery(programsQuery);
  const routines = routinesList.data ?? NONE_ROUTINES;
  const programs = programsList.data ?? NONE_PROGRAMS;
  const loading = routinesList.isPending || programsList.isPending;

  if (!seeded && programsList.data) {
    const current = programsList.data.find((p) => p.id === programId);
    if (current) {
      setName(current.name);
      setSelected(current.routines.map((r) => r.id));
    }
    setSeeded(true);
  }

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
        await refetchAll(queryClient, programsQuery);
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
      await refetchAll(queryClient, programsQuery);
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
          <Spinner className="size-10 text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {saving && <LoadingOverlay label="Guardando..." />}

      <AppHeader
        leftAction={<BackAction href={routes.programs()} />}
        title={isEdit ? "Editar Programa" : "Nuevo Programa"}
        rightAction={
          programId ? (
            <div className="flex items-center gap-4">
              <Link
                href={routes.programPublish(programId)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Publicar programa"
                aria-label="Publicar programa"
              >
                <Globe className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Eliminar programa"
                aria-label="Eliminar programa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ) : undefined
        }
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="program-name"
              className="kicker text-muted-foreground text-3xs"
            >
              Nombre del programa
            </label>
            <input
              id="program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Upper/Lower"
              className={heading({
                size: "md",
                className:
                  "w-full bg-transparent border-b-2 border-input focus:border-primary text-foreground px-0 py-2 outline-none transition-colors placeholder:text-muted-foreground/40",
              })}
              autoComplete="off"
            />
            {duplicateName && (
              <p className="text-sm text-destructive">
                Ya tienes un programa con ese nombre.
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="kicker text-muted-foreground text-3xs">
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
              <p className="text-sm opacity-70 mb-4">
                Crea tus rutinas primero y luego agrúpalas aquí.
              </p>
              <Link
                href={routes.routineNew()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border-2 border-input font-bold text-foreground hover:border-border active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Crear rutina
              </Link>
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
                    className={cn(
                      "w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98]",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card hover:border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-lg grid place-items-center font-display text-lg",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
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

          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="hover:shadow-xl hover:shadow-primary/30"
          >
            {isEdit ? "Guardar Cambios" : "Crear Programa"}
          </Button>
        </div>
      </main>
    </PageShell>
  );
}
