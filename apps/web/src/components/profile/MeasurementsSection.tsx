"use client";

import { useState } from "react";
import { useMeasurements } from "@/hooks/useMeasurements";
import {
  MEASURE_FIELDS,
  formatMeasurement,
  formatShortDate,
  latestByField,
  todayLocal,
} from "@/lib/measurements";
import { MeasureSheet } from "./MeasureSheet";
import { ChevronRight, Loader2, Plus, Ruler } from "lucide-react";

const RECENT = 3;

export function MeasurementsSection() {
  const { measurements, loading, save, remove } = useMeasurements();
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const latest = latestByField(measurements);
  const openNew = () => setSheetDate(todayLocal());

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-2 min-h-9">
        <p className="kicker text-primary text-[0.7rem]">{"// medidas"}</p>
        {measurements.length > 0 && (
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-xl border-2 border-primary px-3 py-1.5 text-primary font-display uppercase tracking-wide text-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Medir
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : measurements.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-input p-5 text-center">
          <Ruler className="w-7 h-7 mx-auto text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground text-balance">
            Agrega tus medidas cuando quieras. Ayudan a tu IA a entender tu
            progreso.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-xl font-display uppercase tracking-wide text-base shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Registrar medida
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {MEASURE_FIELDS.map(({ key, label, unit }) => {
              const last = latest[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl border-2 border-input bg-card px-2 py-3 text-center"
                >
                  <p className="kicker text-[0.55rem] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1.5 font-display font-bold text-2xl leading-none tabular-nums text-foreground">
                    {last ? last.value : "—"}
                    {last && (
                      <span className="ml-0.5 text-sm text-muted-foreground">
                        {unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                    {last ? formatShortDate(last.date) : "sin dato"}
                  </p>
                </div>
              );
            })}
          </div>

          <ul className="mt-2 rounded-2xl border-2 border-input bg-card divide-y divide-border overflow-hidden">
            {measurements.slice(0, RECENT).map((m) => (
              <li key={m.date}>
                <button
                  type="button"
                  onClick={() => setSheetDate(m.date)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  <span className="kicker text-[0.65rem] text-muted-foreground w-20 shrink-0">
                    {formatShortDate(m.date)}
                  </span>
                  <span className="flex-1 min-w-0 text-sm font-bold text-foreground tabular-nums truncate">
                    {formatMeasurement(m)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </li>
            ))}
          </ul>
          {measurements.length > RECENT && (
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              {measurements.length - RECENT} más. Para editar una anterior,
              elige su fecha en Medir.
            </p>
          )}
        </>
      )}

      {sheetDate && (
        <MeasureSheet
          initialDate={sheetDate}
          measurements={measurements}
          onSave={save}
          onDelete={remove}
          onClose={() => setSheetDate(null)}
        />
      )}
    </section>
  );
}
