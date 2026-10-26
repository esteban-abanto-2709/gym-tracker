"use client";

import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { Theme } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { Check, Monitor, Moon, Sun, X } from "lucide-react";
import { heading } from "@/components/base/heading";

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

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
      />

      <div
        role="dialog"
        aria-label="Tema"
        className="anchor-bottom fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[90dvh] overflow-y-auto animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto">
          <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3" />

          <div className="flex items-start justify-between">
            <div>
              <p className="kicker text-primary text-3xs">
                {"// preferencias"}
              </p>
              <h2
                className={heading({
                  size: "sm",
                  className: "text-foreground leading-none mt-1",
                })}
              >
                Tema
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

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
                  className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-input bg-muted/40 hover:border-primary/50"
                  }`}
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
      </div>
    </>,
    document.body,
  );
}
