import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, HistoryAction } from "@/components/layout/AppHeader";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { routes } from "@/lib/routes";
import { Zap, Plus } from "lucide-react";

export default function Home() {
  return (
    <PageShell>
      <AppHeader leftAction={<AccountMenu />} rightAction={<HistoryAction />} />

      <main className="flex-1 px-6 py-8 relative z-10 animate-fade-in-up">
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
          <Link
            href={routes.routines()}
            className="relative block overflow-hidden rounded-3xl bg-foreground text-background p-6 shadow-lg active:scale-[0.98] transition-all"
          >
            <div className="absolute top-0 right-0 bottom-0 w-16 hazard-bar opacity-90" />
            <p className="kicker text-[0.65rem] opacity-55 relative">
              Empieza fuerte
            </p>
            <p className="font-display font-bold uppercase text-5xl leading-[0.85] mt-3 relative">
              Iniciar
              <br />
              rutina
            </p>
            <p className="text-sm mt-3 opacity-60 relative">
              Elige tu rutina y ve paso a paso · ▶
            </p>
          </Link>

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
    </PageShell>
  );
}
