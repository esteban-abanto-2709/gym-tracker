"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { usePrograms } from "@/hooks/usePrograms";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { Check, Compass, Layers, Loader2, Pencil, Plus } from "lucide-react";

export default function ProgramsPage() {
  const { programs, activeProgramId, loading, setActive } = usePrograms();

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.routines()} />}
        title="Programas"
        rightAction={
          <Link
            href={routes.programNew()}
            className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
            title="Nuevo programa"
            aria-label="Nuevo programa"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </Link>
        }
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : programs.length === 0 ? (
            <Link
              href={routes.programNew()}
              className="flex flex-col items-center text-center py-10 px-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
            >
              <Layers className="w-10 h-10 mb-3 opacity-50" />
              <span className="font-display font-bold uppercase text-foreground text-2xl tracking-tight">
                Crea tu programa
              </span>
              <span className="text-sm opacity-70">
                Agrupa tus rutinas en el orden en que las haces.
              </span>
            </Link>
          ) : (
            <>
              {programs.map((program) => {
                const isActive = program.id === activeProgramId;
                return (
                  <div
                    key={program.id}
                    className={`flex items-center gap-2 rounded-2xl border-2 p-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-input bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(isActive ? null : program.id)}
                      aria-pressed={isActive}
                      className="min-w-0 flex-1 flex items-center gap-3 p-1 text-left active:scale-[0.98] transition-all"
                    >
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full border-2 grid place-items-center ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {isActive && (
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-foreground truncate">
                          {program.name}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {program.routines.map((r) => r.name).join(" → ")}
                        </span>
                      </span>
                    </button>
                    <Link
                      href={routes.programEdit(program.id)}
                      className="shrink-0 p-2.5 text-muted-foreground hover:text-primary transition-colors rounded-xl bg-muted/30 hover:bg-muted"
                      title="Editar programa"
                      aria-label="Editar programa"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                {activeProgramId
                  ? "Toca el programa activo para desactivarlo."
                  : "Toca un programa para activarlo."}
              </p>
            </>
          )}

          {!loading && (
            <Link
              href={routes.explore()}
              className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-muted-foreground hover:border-primary/50 hover:text-foreground active:scale-[0.98] transition-all"
            >
              <Compass className="shrink-0 w-6 h-6" strokeWidth={2.5} />
              <span className="min-w-0">
                <span className="block font-bold text-foreground">
                  Explorar programas
                </span>
                <span className="block text-xs">
                  Copia uno armado por otra persona.
                </span>
              </span>
            </Link>
          )}
        </div>
      </main>
    </PageShell>
  );
}
