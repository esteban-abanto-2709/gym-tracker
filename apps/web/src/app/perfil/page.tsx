"use client";

import { useAuth } from "@/lib/auth-context";
import { usePrograms } from "@/hooks/usePrograms";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loader2, LogOut } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const { programs, activeProgramId, nextRoutineId, loading } = usePrograms();
  const activeProgram = programs.find((p) => p.id === activeProgramId);
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
            <p className="kicker text-muted-foreground text-[0.65rem]">
              Programa de entrenamiento
            </p>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : !activeProgram ? (
              <p className="rounded-2xl border-2 border-dashed border-border p-5 text-sm text-muted-foreground">
                Aún no sigues un programa.
              </p>
            ) : (
              <div className="rounded-2xl border-2 border-input bg-card p-5">
                <p className="font-display font-bold uppercase text-foreground text-3xl leading-none tracking-tight">
                  {activeProgram.name}
                </p>
                <ol className="mt-4 space-y-2">
                  {activeProgram.routines.map((routine, index) => {
                    const isNext = routine.id === nextRoutineId;
                    return (
                      <li key={routine.id} className="flex items-center gap-3">
                        <span
                          className={`shrink-0 w-7 h-7 rounded-lg grid place-items-center font-display ${
                            isNext
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`min-w-0 flex-1 truncate ${
                            isNext
                              ? "font-bold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {routine.name}
                        </span>
                        {isNext && (
                          <span className="shrink-0 kicker text-[0.6rem] text-primary">
                            Hoy toca
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
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
