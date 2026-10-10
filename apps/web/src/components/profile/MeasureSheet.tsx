"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import type { BodyMeasurement } from "@/lib/types";
import {
  MEASURE_FIELDS,
  type MeasureField,
  todayLocal,
} from "@/lib/measurements";
import { notifyError } from "@/lib/notify";
import { Check, Trash2, X } from "lucide-react";

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
      notifyError("No se pudo guardar la medida", save);
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
      notifyError("No se pudo borrar la medida");
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

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
      />

      <div
        role="dialog"
        aria-label={existing ? "Editar medida" : "Registrar medida"}
        style={viewportStyle}
        className="anchor-bottom fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[90dvh] overflow-y-auto animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto">
          <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3" />

          <div className="flex items-start justify-between">
            <div>
              <p className="kicker text-primary text-[0.65rem]">
                {"// medidas"}
              </p>
              <h2 className="font-display font-bold uppercase text-2xl text-foreground tracking-tight leading-none mt-1">
                {existing ? "Editar medida" : "Registrar medida"}
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

          <label className="mt-4 block">
            <span className="kicker text-[0.6rem] text-muted-foreground">
              Fecha
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
            Llena solo lo que te midieron.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {MEASURE_FIELDS.map(({ key, label, unit }) => (
              <label
                key={key}
                className={`min-w-0 flex flex-col items-center gap-0.5 rounded-2xl border-2 bg-muted/60 px-2 py-2.5 transition-all focus-within:border-primary ${
                  invalid.some((f) => f.key === key)
                    ? "border-destructive"
                    : "border-transparent"
                }`}
              >
                <span className="kicker text-[0.6rem] text-muted-foreground">
                  {label}
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
                  aria-label={`${label} (${unit})`}
                  className="w-full bg-transparent text-center font-display font-bold text-3xl text-foreground tabular-nums placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">{unit}</span>
              </label>
            ))}
          </div>
          {invalid.length > 0 && (
            <p className="mt-2 text-xs text-destructive">
              {invalid
                .map((f) => `${f.label} entre ${f.min} y ${f.max} ${f.unit}`)
                .join(" · ")}
            </p>
          )}

          <button
            type="button"
            onClick={save}
            disabled={!canSave || busy}
            className="mt-5 w-full py-3.5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
            {existing ? "Actualizar" : "Guardar"}
          </button>

          {existing && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="mt-1 w-full py-2.5 text-muted-foreground hover:text-destructive font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? "Toca otra vez para borrar" : "Borrar medida"}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
