import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { StartRoutineCard } from "@/components/train/StartRoutineCard";
import { routes } from "@/lib/routes";
import { Zap, Plus } from "lucide-react";

export default function Home() {
  return (
    <PageShell>
      <main className="flex-1 px-6 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-28 relative z-10 animate-fade-in-up">
        <div className="max-w-md w-full mx-auto space-y-5">
          {/* Hero */}
          <div>
            <p className="kicker text-primary text-[0.7rem]">
              // listo para entrenar
            </p>
            <h2 className="font-display font-bold uppercase text-foreground text-[2.75rem] leading-[0.9] tracking-tight mt-2">
              Hoy
              <br />
              <span className="text-primary">entrenas.</span>
            </h2>
          </div>

          <ContinueRoutineBanner />

          {/* Primary: iniciar rutina — tarjeta invertida con cinta hazard */}
          <StartRoutineCard />

          {/* Secundarias */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={routes.log()}
              className="flex flex-col gap-2 min-h-[92px] p-4 bg-card border-2 border-input rounded-2xl hover:border-border active:scale-[0.98] transition-all"
            >
              <Zap className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <span className="font-bold text-foreground leading-tight">
                Día libre
              </span>
              <span className="text-xs text-muted-foreground">Un set suelto</span>
            </Link>

            <Link
              href={routes.routineNew()}
              className="flex flex-col gap-2 min-h-[92px] p-4 bg-card border-2 border-input rounded-2xl hover:border-border active:scale-[0.98] transition-all"
            >
              <Plus className="w-6 h-6 text-muted-foreground" strokeWidth={2.5} />
              <span className="font-bold text-foreground leading-tight">
                Crear rutina
              </span>
              <span className="text-xs text-muted-foreground">Arma la tuya</span>
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </PageShell>
  );
}
