"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { routes } from "@/lib/routes";
import { useAuth } from "@/lib/auth-context";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { BirthDateRow } from "@/components/profile/BirthDateRow";
import { LanguageSheet } from "@/components/profile/LanguageSheet";
import { THEME_OPTIONS, ThemeSheet } from "@/components/profile/ThemeSheet";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { PasswordRow } from "@/components/profile/PasswordRow";
import {
  ChevronRight,
  Languages,
  LogOut,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";

const rowClass =
  "w-full text-left flex items-center gap-4 border-t-2 border-input px-5 py-3 transition-colors active:bg-muted";

function RowContent({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <>
      <div className="shrink-0 w-14 grid place-items-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="kicker text-[0.6rem] text-muted-foreground">{label}</p>
        <p className="font-bold text-foreground truncate">{value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </>
  );
}

function Group({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <p className="kicker text-primary text-[0.7rem] mb-2">{kicker}</p>
      <div className="rounded-2xl border-2 border-input bg-card overflow-hidden [&>*:first-child]:border-t-0">
        {children}
      </div>
    </section>
  );
}

export default function AjustesPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const currentTheme =
    THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0];
  const [themeOpen, setThemeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <PageShell variant="history">
      <AppHeader
        title="Ajustes"
        leftAction={<BackAction href={routes.profile()} />}
      />
      <main className="flex-1 px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <Group kicker="// app">
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              className={rowClass}
            >
              <RowContent
                Icon={currentTheme.icon}
                label="Tema"
                value={currentTheme.label}
              />
            </button>
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className={rowClass}
            >
              <RowContent
                Icon={Languages}
                label="Nombres de ejercicios"
                value={user?.exerciseLocale === "es" ? "Español" : "English"}
              />
            </button>
          </Group>

          <Group kicker="// cuenta">
            <BirthDateRow />
            {user?.hasPassword && <PasswordRow />}
            <Link href={routes.privacy()} className={rowClass}>
              <RowContent
                Icon={ShieldCheck}
                label="Privacidad"
                value="Qué guardamos y quién lo ve"
              />
            </Link>
          </Group>

          <div className="mt-6 rounded-2xl border-2 border-input bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-5 py-4 font-bold text-destructive transition-colors active:bg-muted"
            >
              <div className="shrink-0 w-14 grid place-items-center">
                <LogOut className="w-5 h-5" />
              </div>
              Cerrar sesión
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-6 mx-auto flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-destructive active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            Borrar mi cuenta
          </button>
        </div>
      </main>

      {themeOpen && <ThemeSheet onClose={() => setThemeOpen(false)} />}

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </PageShell>
  );
}
