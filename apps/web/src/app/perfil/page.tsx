"use client";

import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { LogOut } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <PageShell variant="history">
      <main className="flex-1 px-6 pt-14 pb-28 relative z-10 animate-fade-in-up">
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
