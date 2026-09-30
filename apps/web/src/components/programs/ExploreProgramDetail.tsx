"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import { formatBlocks } from "@/lib/blocks";
import type { CopiedProgram } from "@/lib/types";
import { useExplorePrograms } from "@/hooks/useExplorePrograms";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { Copy, Loader2 } from "lucide-react";

export function ExploreProgramDetail({ programId }: { programId: string }) {
  const router = useRouter();
  const { programs, loading } = useExplorePrograms();
  const [copying, setCopying] = useState(false);
  const program = programs.find((p) => p.id === programId);

  const handleCopy = async () => {
    setCopying(true);
    try {
      const { activated } = await api.post<CopiedProgram>(
        routes.api.programs.copy(programId),
      );
      router.push(activated ? routes.home() : routes.programs());
    } catch (e) {
      console.error("Error copying program:", e);
      setCopying(false);
      notifyError("No se pudo copiar el programa", handleCopy);
    }
  };

  return (
    <PageShell variant="history">
      {copying && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <p className="text-lg font-bold text-foreground animate-pulse">
            Copiando...
          </p>
        </div>
      )}

      <AppHeader
        leftAction={<BackAction href={routes.explore()} />}
        title="Programa"
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : !program ? (
            <p className="text-center text-muted-foreground py-16">
              Este programa ya no está disponible.
            </p>
          ) : (
            <>
              <div>
                <p className="kicker text-primary text-[0.65rem]">
                  de {program.user.username}
                </p>
                <h1 className="font-display font-bold uppercase text-foreground text-4xl leading-[0.9] tracking-tight mt-2 break-words">
                  {program.name}
                </h1>
              </div>

              <div className="space-y-3">
                {program.routines.map((routine, index) => (
                  <section
                    key={routine.id}
                    className="rounded-2xl border-2 border-input bg-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-secondary grid place-items-center font-display text-muted-foreground">
                        {index + 1}
                      </span>
                      <h2 className="font-bold text-foreground text-lg leading-tight truncate">
                        {routine.name}
                      </h2>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {routine.items.map((item) => {
                        const target = formatBlocks(item.blocks);
                        return (
                          <li
                            key={item.id ?? item.position}
                            className="flex items-baseline justify-between gap-3 text-sm"
                          >
                            <span className="min-w-0 truncate text-foreground">
                              {item.exercise.name}
                            </span>
                            {target && (
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {target}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={copying}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Copy className="w-5 h-5" strokeWidth={2.5} />
                  Copiar programa
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  Es tu copia: puedes cambiarla sin tocar la original.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}
