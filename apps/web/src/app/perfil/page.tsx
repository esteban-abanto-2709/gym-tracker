"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { routes } from "@/lib/routes";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { BottomNav } from "@/components/layout/BottomNav";
import { BirthDateRow } from "@/components/profile/BirthDateRow";
import { LanguageSheet } from "@/components/profile/LanguageSheet";
import { THEME_OPTIONS, ThemeSheet } from "@/components/profile/ThemeSheet";
import { MeasurementsSection } from "@/components/profile/MeasurementsSection";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { PasswordRow } from "@/components/profile/PasswordRow";
import { Languages, LogOut, Trash2 } from "lucide-react";

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const initial = user?.username?.charAt(0)?.toUpperCase() ?? "?";
  const { theme } = useTheme();
  const ThemeIcon = (
    THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0]
  ).icon;
  const [themeOpen, setThemeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <PageShell variant="history">
      <main className="flex-1 px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-nav relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <p className="kicker text-primary text-[0.7rem]">{"// tu cuenta"}</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h1 className="font-display font-bold uppercase text-foreground text-5xl leading-[0.9] tracking-tight">
              Perfil
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setThemeOpen(true)}
                aria-label="Tema"
                className="flex items-center rounded-xl border-2 border-input px-2.5 py-1.5 text-muted-foreground hover:text-primary hover:border-primary/50 active:scale-95 transition-all"
              >
                <ThemeIcon className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setLanguageOpen(true)}
                aria-label="Idioma"
                className="flex items-center gap-1.5 rounded-xl border-2 border-input px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary/50 active:scale-95 transition-all"
              >
                <Languages className="w-4 h-4" strokeWidth={2.5} />
                <span className="font-display uppercase tracking-wide">
                  {user?.exerciseLocale ?? "en"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-xl border-2 border-input px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-destructive hover:border-destructive/50 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" strokeWidth={2.5} />
                Salir
              </button>
            </div>
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
            {user?.hasPassword && <PasswordRow />}
          </div>

          <MeasurementsSection />

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-10 mx-auto flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-destructive active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            Borrar mi cuenta
          </button>
          <Link
            href={routes.privacy()}
            className="mt-4 block text-xs text-center text-muted-foreground underline underline-offset-4"
          >
            Privacidad
          </Link>
        </div>
      </main>

      {themeOpen && <ThemeSheet onClose={() => setThemeOpen(false)} />}

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />

      <BottomNav />
    </PageShell>
  );
}
