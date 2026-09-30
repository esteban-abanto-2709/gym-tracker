"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { usePrograms } from "@/hooks/usePrograms";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { Check, Layers, Loader2, LogOut, Pencil, Plus } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const { programs, activeProgramId, loading, setActive } = usePrograms();
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <PageShell variant="history">
      <main className="flex-1 px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-28 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <p className="kicker text-primary text-[0.7rem]">// tu cuenta</p>
          <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.9] tracking-tight mt-2">
            Perfil
          </h1>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border-2 border-input bg-card p-5">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-secondary grid place-items-center font-display text-2xl text-foreground">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-lg truncate">
                {user?.username ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <section className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <p className="kicker text-muted-foreground text-[0.65rem]">
                Programa de entrenamiento
              </p>
              <Link
                href={routes.programNew()}
                className="text-muted-foreground hover:text-foreground transition-all active:scale-90"
                title="Nuevo programa"
                aria-label="Nuevo programa"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : programs.length === 0 ? (
              <Link
                href={routes.programNew()}
                className="flex flex-col items-center text-center py-8 px-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground"
              >
                <Layers className="w-8 h-8 mb-2 opacity-50" />
                <span className="font-medium text-foreground">
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
          </section>

          <button
            type="button"
            onClick={() => logout()}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-input bg-card py-4 font-bold text-destructive active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
            Cerrar sesión
          </button>
        </div>
      </main>

      <BottomNav />
    </PageShell>
  );
}
