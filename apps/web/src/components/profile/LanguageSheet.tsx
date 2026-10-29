"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { AuthUser, Locale } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { Spinner } from "@/components/base/spinner";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { fieldInputClass } from "@/components/base/field";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/i18n/locale";

type LanguageField = "interfaceLocale" | "exerciseLocale";

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LanguageSheet({ onClose }: { onClose: () => void }) {
  const t = useTranslations("profile.language");
  const { user, updateMe } = useAuth();
  const [saving, setSaving] = useState<LanguageField | null>(null);

  const save = async (field: LanguageField, value: Locale) => {
    setSaving(field);
    try {
      await updateMe({ [field]: value } as Pick<AuthUser, LanguageField>);
    } catch {
      notifyError(t("saveError"));
    } finally {
      setSaving(null);
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

        <LanguageSelect
          label={t("exerciseNames")}
          hint={t("exerciseNamesHint")}
          value={user?.exerciseLocale ?? "en"}
          saving={saving === "exerciseLocale"}
          disabled={saving !== null}
          onChange={(value) => save("exerciseLocale", value)}
        />

        <LanguageSelect
          label={t("interface")}
          hint={t("interfaceHint")}
          value={user?.interfaceLocale ?? "en"}
          saving={saving === "interfaceLocale"}
          disabled={saving !== null}
          onChange={(value) => save("interfaceLocale", value)}
        />
      </div>
    </BottomSheet>
  );
}

function LanguageSelect({
  label,
  hint,
  value,
  saving,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: Locale;
  saving: boolean;
  disabled: boolean;
  onChange: (value: Locale) => void;
}) {
  const id = useId();
  return (
    <div className="mt-5">
      <label htmlFor={id} className="kicker text-4xs text-muted-foreground">
        {label}
      </label>
      <p className="mt-1 text-sm text-muted-foreground text-balance">{hint}</p>
      <div className="relative mt-3">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value as Locale)}
          className={cn(
            fieldInputClass,
            "w-full appearance-none pr-12 font-bold text-foreground outline-none focus:border-primary disabled:opacity-60",
          )}
        >
          {LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LANGUAGE_NAMES[locale]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary">
          {saving ? (
            <Spinner className="size-5" />
          ) : (
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          )}
        </span>
      </div>
    </div>
  );
}
