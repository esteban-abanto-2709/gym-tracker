"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { ageOn, formatShortDate, todayLocal } from "@/lib/measurements";
import { notifyError } from "@/lib/notify";
import { Cake, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SettingsRowContent,
  settingsRowClass,
} from "@/components/profile/SettingsRow";

export function BirthDateRow() {
  const t = useTranslations("profile.birth");
  const locale = useLocale();
  const { user, updateMe } = useAuth();
  const saved = user?.birthDate ?? null;
  const [draft, setDraft] = useState(saved ?? "");

  const commit = async () => {
    const next = draft || null;
    if (next === saved) return;
    try {
      await updateMe({ birthDate: next });
    } catch {
      setDraft(saved ?? "");
      notifyError(t("saveError"));
    }
  };

  return (
    <label
      className={cn(
        settingsRowClass,
        "relative cursor-pointer focus-within:bg-muted/50",
      )}
    >
      <SettingsRowContent
        Icon={Cake}
        label={t("label")}
        value={
          draft
            ? t("value", {
                date: formatShortDate(draft, locale),
                age: ageOn(draft),
              })
            : t("add")
        }
        Trailing={Pencil}
      />
      <input
        type="date"
        value={draft}
        max={todayLocal()}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        onBlur={commit}
        aria-label={t("input")}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
  );
}
