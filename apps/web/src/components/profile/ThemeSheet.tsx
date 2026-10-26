"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { Theme } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { cn } from "@/lib/utils";

export const THEME_OPTIONS: {
  value: Theme;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    value: "system",
    label: "Sistema",
    hint: "Sigue el modo de tu celular",
    icon: Monitor,
  },
  { value: "light", label: "Claro", hint: "Siempre claro", icon: Sun },
  { value: "dark", label: "Oscuro", hint: "Siempre oscuro", icon: Moon },
];

export function ThemeSheet({ onClose }: { onClose: () => void }) {
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
      notifyError("No se pudo guardar el tema");
    }
  };

  return (
    <BottomSheet label="Tema" onClose={onClose}>
      <div className="max-w-md mx-auto">
        <SheetHeader kicker="// preferencias" title="Tema" onClose={onClose} />

        <div role="radiogroup" aria-label="Tema" className="mt-5 grid gap-2">
          {THEME_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
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
                    {label}
                  </span>
                  <span className="block text-sm text-muted-foreground truncate">
                    {hint}
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
