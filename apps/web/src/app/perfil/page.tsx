"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { MeasurementsSection } from "@/components/profile/MeasurementsSection";
import { Settings } from "lucide-react";

export default function PerfilPage() {
  const { user } = useAuth();
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <PageShell variant="history">
      <main className="flex-1 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-nav relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <p className="kicker text-primary text-[0.7rem]">{"// tu cuenta"}</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.9] tracking-tight">
              Perfil
            </h1>
            <Link
              href={routes.settings()}
              aria-label="Ajustes"
              className="w-11 h-11 grid place-items-center rounded-xl border-2 border-input text-muted-foreground hover:text-primary hover:border-primary/50 active:scale-95 transition-all"
            >
              <Settings className="w-5 h-5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-input bg-card flex items-center gap-4 p-5">
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

          <MeasurementsSection />
        </div>
      </main>

      <BottomNav />
    </PageShell>
  );
}
