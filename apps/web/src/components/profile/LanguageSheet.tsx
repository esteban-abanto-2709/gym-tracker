"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { Locale } from "@/lib/types";
import { Check, X } from "lucide-react";
import { heading } from "@/components/base/heading";
import { Spinner } from "@/components/base/spinner";

const EXERCISE_LANGUAGES: { value: Locale; label: string; example: string }[] =
  [
    { value: "en", label: "English", example: "Bench Press · Lat Pulldown" },
    {
      value: "es",
      label: "Español",
      example: "Press de banca · Jalón al pecho",
    },
  ];

export function LanguageSheet({ onClose }: { onClose: () => void }) {
  const { user, updateMe } = useAuth();
  const [saving, setSaving] = useState<Locale | null>(null);
  const current = user?.exerciseLocale ?? "en";

  const choose = async (value: Locale) => {
    if (value === current || saving) return;
    setSaving(value);
    try {
      await updateMe({ exerciseLocale: value });
    } catch {
      notifyError("No se pudo guardar el idioma");
    } finally {
      setSaving(null);
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
        aria-label="Idioma"
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
                Idioma
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

          <p className="mt-5 kicker text-4xs text-muted-foreground">
            Nombres de ejercicios
          </p>
          <p className="mt-1 text-sm text-muted-foreground text-balance">
            Cómo se ven en tus rutinas y tu historial. Para buscar sirve
            cualquier idioma.
          </p>

          <div
            role="radiogroup"
            aria-label="Nombres de ejercicios"
            className="mt-3 grid gap-2"
          >
            {EXERCISE_LANGUAGES.map(({ value, label, example }) => {
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
                  <span
                    className={heading({
                      className:
                        "shrink-0 w-11 text-2xl leading-none text-primary",
                    })}
                  >
                    {value}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-foreground">
                      {label}
                    </span>
                    <span className="block text-sm text-muted-foreground truncate">
                      {example}
                    </span>
                  </span>
                  {saving === value ? (
                    <Spinner className="size-5 text-primary shrink-0" />
                  ) : (
                    selected && (
                      <Check
                        className="w-5 h-5 text-primary shrink-0"
                        strokeWidth={3}
                      />
                    )
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
