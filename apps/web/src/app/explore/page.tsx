"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { useExplorePrograms } from "@/hooks/useExplorePrograms";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { ChevronRight, Compass, Loader2 } from "lucide-react";

export default function ExplorePage() {
  const { programs, loading } = useExplorePrograms();

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.programs()} />}
        title="Explorar"
      />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-sm text-muted-foreground">
            Programas armados por otros. Copia uno y ajústalo a tu gimnasio.
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : programs.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6 text-muted-foreground">
              <Compass className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-display font-bold uppercase text-foreground text-2xl tracking-tight">
                Nada por explorar
              </p>
              <p className="text-sm opacity-70">
                Aún nadie más ha armado un programa.
              </p>
            </div>
          ) : (
            programs.map((program) => (
              <Link
                key={program.id}
                href={routes.exploreProgram(program.id)}
                className="flex items-center gap-3 rounded-2xl border-2 border-input bg-card p-4 hover:border-primary/50 active:scale-[0.98] transition-all"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-foreground text-lg leading-tight truncate">
                    {program.name}
                  </span>
                  <span className="block kicker text-[0.6rem] text-muted-foreground mt-1.5">
                    de {program.user.username} · {program.routines.length}{" "}
                    {program.routines.length === 1 ? "rutina" : "rutinas"}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate mt-1">
                    {program.routines.map((r) => r.name).join(" → ")}
                  </span>
                </span>
                <ChevronRight className="shrink-0 w-5 h-5 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </main>
    </PageShell>
  );
}
