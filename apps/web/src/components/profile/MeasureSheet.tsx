"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import type { BodyMeasurement } from "@/lib/types";
import {
  MEASURE_FIELDS,
  type MeasureField,
  todayLocal,
} from "@/lib/measurements";
import { notifyError } from "@/lib/notify";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/base/button";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { cn } from "@/lib/utils";

type Values = Record<MeasureField, string>;

const valuesOf = (m?: BodyMeasurement): Values => ({
  weightKg: m?.weightKg?.toString() ?? "",
  bodyFatPct: m?.bodyFatPct?.toString() ?? "",
  heightCm: m?.heightCm?.toString() ?? "",
});

interface MeasureSheetProps {
  initialDate: string;
  measurements: BodyMeasurement[];
  onSave: (measurement: BodyMeasurement) => Promise<void>;
  onDelete: (date: string) => Promise<void>;
  onClose: () => void;
}

export function MeasureSheet({
  initialDate,
  measurements,
  onSave,
  onDelete,
  onClose,
}: MeasureSheetProps) {
  const t = useTranslations("profile.measurements");
  const find = (d: string) => measurements.find((m) => m.date === d);
  const [date, setDate] = useState(initialDate);
  const [values, setValues] = useState<Values>(() =>
    valuesOf(find(initialDate)),
  );
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const viewport = useVisualViewport(true);
  const today = todayLocal();
  const existing = find(date);
  const invalid = MEASURE_FIELDS.filter(({ key, min, max }) => {
    if (values[key] === "") return false;
    const n = Number(values[key]);
    return Number.isNaN(n) || n < min || n > max;
  });
  const hasAny = MEASURE_FIELDS.some(({ key }) => values[key] !== "");
  const canSave = hasAny && invalid.length === 0 && !!date && date <= today;

  const changeDate = (next: string) => {
    setDate(next);
    setValues(valuesOf(find(next)));
    setConfirmDelete(false);
  };

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    const num = (key: MeasureField) =>
      values[key] === "" ? null : Number(values[key]);
    try {
      await onSave({
        date,
        weightKg: num("weightKg"),
        bodyFatPct: num("bodyFatPct"),
        heightCm: num("heightCm"),
      });
      onClose();
    } catch {
      notifyError(t("saveError"), save);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    try {
      await onDelete(date);
      onClose();
    } catch {
      notifyError(t("deleteError"));
    } finally {
      setBusy(false);
    }
  };

  const keyboard = viewport
    ? window.innerHeight - viewport.height - viewport.offsetTop
    : 0;
  const viewportStyle =
    viewport && keyboard > 0
      ? { bottom: `${keyboard}px`, maxHeight: `${viewport.height - 16}px` }
      : undefined;

  return (
    <BottomSheet
      label={t(existing ? "edit" : "add")}
      style={viewportStyle}
      onClose={onClose}
    >
      <div className="max-w-md mx-auto">
        <SheetHeader
          kicker={t("kicker")}
          title={t(existing ? "edit" : "add")}
          onClose={onClose}
        />

        <label className="mt-4 block">
          <span className="kicker text-4xs text-muted-foreground">
            {t("date")}
          </span>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => changeDate(e.target.value)}
            className="mt-1.5 block w-full min-w-0 appearance-none px-4 py-3 bg-muted border-2 border-transparent rounded-xl font-bold text-foreground text-left focus:outline-none focus:border-primary transition-all [&::-webkit-date-and-time-value]:text-left"
          />
        </label>

        <p className="mt-4 text-sm text-muted-foreground">
          {t("fillWhatYouHave")}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {MEASURE_FIELDS.map(({ key, unit }) => (
            <label
              key={key}
              className={cn(
                "min-w-0 flex flex-col items-center gap-0.5 rounded-2xl border-2 bg-muted/60 px-2 py-2.5 transition-all focus-within:border-primary",
                invalid.some((f) => f.key === key)
                  ? "border-destructive"
                  : "border-transparent",
              )}
            >
              <span className="kicker text-4xs text-muted-foreground">
                {t(`fields.${key}`)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="—"
                value={values[key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [key]: e.target.value }))
                }
                aria-label={t("fieldInput", {
                  field: t(`fields.${key}`),
                  unit,
                })}
                className="w-full bg-transparent text-center font-display font-bold text-3xl text-foreground tabular-nums placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">{unit}</span>
            </label>
          ))}
        </div>
        {invalid.length > 0 && (
          <p className="mt-2 text-xs text-destructive">
            {invalid
              .map((f) =>
                t("range", {
                  field: t(`fields.${f.key}`),
                  min: f.min,
                  max: f.max,
                  unit: f.unit,
                }),
              )
              .join(" · ")}
          </p>
        )}

        <Button
          type="button"
          onClick={save}
          disabled={!canSave || busy}
          className="mt-5 py-3.5 disabled:opacity-40"
        >
          <Check className="w-5 h-5" strokeWidth={2.5} />
          {t(existing ? "update" : "save")}
        </Button>

        {existing && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="mt-1 w-full py-2.5 text-muted-foreground hover:text-destructive font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            {t(confirmDelete ? "confirmDelete" : "delete")}
          </button>
        )}
      </div>
    </BottomSheet>
  );
}
