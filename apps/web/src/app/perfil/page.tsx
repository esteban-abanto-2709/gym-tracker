"use client";

import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { BirthDateRow } from "@/components/profile/BirthDateRow";
import { MeasurementsSection } from "@/components/profile/MeasurementsSection";
import { LogOut } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <PageShell variant="history">
      <main className="flex-1 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-22 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <p className="kicker text-primary text-[0.7rem]">{"// tu cuenta"}</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.9] tracking-tight">
              Perfil
            </h1>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-xl border-2 border-input px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-destructive hover:border-destructive/50 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              Salir
            </button>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-input bg-card overflow-hidden">
            <div className="flex items-center gap-4 p-5">
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
            <BirthDateRow />
          </div>

          <MeasurementsSection />
        </div>
      </main>

      <BottomNav />
    </PageShell>
  );
}
