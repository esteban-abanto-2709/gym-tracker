"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  SettingsRowContent,
  settingsRowClass,
} from "@/components/profile/SettingsRow";
import { Languages, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

function Group({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <p className="kicker text-primary text-2xs mb-2">{kicker}</p>
      <div
        className={cn(
          surfaceClass,
          "overflow-hidden [&>*:first-child]:border-t-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export default function AjustesPage() {
  const t = useTranslations("profile");
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
        title={t("settings.title")}
        leftAction={<BackAction href={routes.profile()} />}
      />
      <main className="flex-1 px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto">
          <Group kicker={t("settings.appGroup")}>
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              className={settingsRowClass}
            >
              <SettingsRowContent
                Icon={currentTheme.icon}
                label={t("settings.theme")}
                value={currentTheme.label}
              />
            </button>
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className={settingsRowClass}
            >
              <SettingsRowContent
                Icon={Languages}
                label={t("language.exerciseNames")}
                value={user?.exerciseLocale === "es" ? "Español" : "English"}
              />
            </button>
          </Group>

          <Group kicker={t("settings.accountGroup")}>
            <BirthDateRow />
            {user?.hasPassword && <PasswordRow />}
            <Link href={routes.privacy()} className={settingsRowClass}>
              <SettingsRowContent
                Icon={ShieldCheck}
                label={t("settings.privacy")}
                value={t("settings.privacyHint")}
              />
            </Link>
          </Group>

          <div className={cn(surfaceClass, "mt-6 overflow-hidden")}>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-5 py-4 font-bold text-destructive transition-colors active:bg-muted"
            >
              <div className="shrink-0 w-14 grid place-items-center">
                <LogOut className="w-5 h-5" />
              </div>
              {t("settings.logout")}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-6 mx-auto flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-destructive active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
            {t("settings.deleteAccount")}
          </button>
        </div>
      </main>

      {themeOpen && <ThemeSheet onClose={() => setThemeOpen(false)} />}

      {languageOpen && <LanguageSheet onClose={() => setLanguageOpen(false)} />}

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </PageShell>
  );
}
