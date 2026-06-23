import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, HistoryAction } from "@/components/layout/AppHeader";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { routes } from "@/lib/routes";
import { Play, Zap, Plus } from "lucide-react";

export default function Home() {
  return (
    <PageShell>
      <AppHeader rightAction={<HistoryAction />} />

      <main className="flex-1 flex flex-col justify-center px-6 py-8 relative z-10 animate-fade-in-up">
        <div className="max-w-md w-full mx-auto space-y-4">
          <ContinueRoutineBanner />

          <Link
            href={routes.routines()}
            className="group relative flex items-center gap-4 w-full p-5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] overflow-hidden"
          >
            <div className="shrink-0 p-3 bg-white/20 rounded-xl">
              <Play className="w-6 h-6" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight">
                Iniciar una rutina
              </p>
              <p className="text-sm opacity-80">Entrena guiado paso a paso</p>
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-[hsl(var(--brand-gradient-end))] to-[hsl(var(--brand-gradient-start))] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </Link>

          <Link
            href={routes.log()}
            className="flex items-center gap-4 w-full p-5 bg-card border-2 border-input rounded-2xl hover:border-border transition-all active:scale-[0.98]"
          >
            <div className="shrink-0 p-3 bg-muted rounded-xl text-primary">
              <Zap className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight text-foreground">
                Día libre
              </p>
              <p className="text-sm text-muted-foreground">
                Registra un set suelto
              </p>
            </div>
          </Link>

          <Link
            href={routes.routineNew()}
            className="flex items-center gap-4 w-full p-5 bg-card border-2 border-input rounded-2xl hover:border-border transition-all active:scale-[0.98]"
          >
            <div className="shrink-0 p-3 bg-muted rounded-xl text-primary">
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight text-foreground">
                Crear rutina
              </p>
              <p className="text-sm text-muted-foreground">
                Arma una rutina nueva
              </p>
            </div>
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
