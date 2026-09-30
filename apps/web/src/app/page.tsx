import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { ContinueRoutineBanner } from "@/components/train/ContinueRoutineBanner";
import { HomeActions } from "@/components/train/HomeActions";

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

          <HomeActions />
        </div>
      </main>

      <BottomNav />
    </PageShell>
  );
}
