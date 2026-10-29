"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { AuthUser, Locale } from "@/lib/types";
import { Check, Smartphone } from "lucide-react";
import { heading } from "@/components/base/heading";
import { Spinner } from "@/components/base/spinner";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/i18n/locale";

type Changes = Partial<Pick<AuthUser, "exerciseLocale" | "interfaceLocale">>;

interface Option<T> {
  value: T;
  code: ReactNode;
  label: string;
  example: string;
}

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

const EXERCISE_EXAMPLES: Record<Locale, string> = {
  en: "Bench Press · Lat Pulldown",
  es: "Press de banca · Jalón al pecho",
};

const INTERFACE_EXAMPLES: Record<Locale, string> = {
  en: "Today · Routines · History",
  es: "Hoy · Rutinas · Historial",
};

export function LanguageSheet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("profile.language");
  const { user, updateMe } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (key: string, changes: Changes) => {
    if (saving) return;
    setSaving(key);
    try {
      await updateMe(changes);
    } catch {
      notifyError(t("saveError"));
    } finally {
      setSaving(null);
    }
  };

  const exerciseOptions: Option<Locale>[] = LOCALES.map((value) => ({
    value,
    code: value,
    label: LANGUAGE_NAMES[value],
    example: EXERCISE_EXAMPLES[value],
  }));

  const interfaceOptions: Option<Locale | null>[] = [
    {
      value: null,
      code: <Smartphone className="w-6 h-6" strokeWidth={2.5} />,
      label: t("phone"),
      example: t("phoneHint"),
    },
    ...LOCALES.map((value) => ({
      value,
      code: value,
      label: LANGUAGE_NAMES[value],
      example: INTERFACE_EXAMPLES[value],
    })),
  ];

  return (
    <BottomSheet label={t("title")} onClose={onClose}>
      <div className="max-w-md mx-auto">
        <SheetHeader
          kicker={t("kicker")}
          title={t("title")}
          onClose={onClose}
        />

        <Choice
          title={t("exerciseNames")}
          hint={t("exerciseNamesHint")}
          options={exerciseOptions}
          current={user?.exerciseLocale ?? "en"}
          saving={saving}
          savingKey={(value) => `exercise-${value}`}
          onChoose={(value) =>
            save(`exercise-${value}`, { exerciseLocale: value })
          }
        />

        <Choice
          title={t("interface")}
          hint={t("interfaceHint")}
          options={interfaceOptions}
          current={user?.interfaceLocale ?? null}
          saving={saving}
          savingKey={(value) => `interface-${value}`}
          onChoose={(value) =>
            save(`interface-${value}`, { interfaceLocale: value })
          }
        />
      </div>
    </BottomSheet>
  );
}

function Choice<T extends Locale | null>({
  title,
  hint,
  options,
  current,
  saving,
  savingKey,
  onChoose,
}: {
  title: string;
  hint: string;
  options: Option<T>[];
  current: T;
  saving: string | null;
  savingKey: (value: T) => string;
  onChoose: (value: T) => void;
}) {
  return (
    <>
      <p className="mt-5 kicker text-4xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground text-balance">{hint}</p>

      <div role="radiogroup" aria-label={title} className="mt-3 grid gap-2">
        {options.map(({ value, code, label, example }) => {
          const selected = value === current;
          return (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => !selected && onChoose(value)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all active:scale-[0.98]",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-input bg-muted/40 hover:border-primary/50",
              )}
            >
              <span
                className={heading({
                  className: "shrink-0 w-11 text-2xl leading-none text-primary",
                })}
              >
                {code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-foreground">{label}</span>
                <span className="block text-sm text-muted-foreground truncate">
                  {example}
                </span>
              </span>
              {saving === savingKey(value) ? (
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
    </>
  );
}
