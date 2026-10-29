"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { Theme } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { cn } from "@/lib/utils";

export const THEME_OPTIONS: { value: Theme; icon: LucideIcon }[] = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
];

export function ThemeSheet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("profile.theme");
  const { user, updateMe } = useAuth();
  const { theme, setTheme } = useTheme();
  const current = theme ?? "system";

  const choose = async (value: Theme) => {
    if (value === current) return;
    setTheme(value);
    try {
      await updateMe({ theme: value });
    } catch {
      setTheme(user?.theme ?? "system");
      notifyError(t("saveError"));
    }
  };

  return (
    <BottomSheet label={t("title")} onClose={onClose}>
      <div className="max-w-md mx-auto">
        <SheetHeader
          kicker={t("kicker")}
          title={t("title")}
          onClose={onClose}
        />

        <div
          role="radiogroup"
          aria-label={t("title")}
          className="mt-5 grid gap-2"
        >
          {THEME_OPTIONS.map(({ value, icon: Icon }) => {
            const selected = value === current;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(value)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98]",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-input bg-muted/40 hover:border-primary/50",
                )}
              >
                <Icon
                  className="shrink-0 w-6 h-6 text-primary"
                  strokeWidth={2.5}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-foreground">
                    {t(value)}
                  </span>
                  <span className="block text-sm text-muted-foreground truncate">
                    {t(`${value}Hint`)}
                  </span>
                </span>
                {selected && (
                  <Check
                    className="w-5 h-5 text-primary shrink-0"
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
