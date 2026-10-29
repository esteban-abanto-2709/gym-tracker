"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMeasurements } from "@/hooks/useMeasurements";
import {
  MEASURE_FIELDS,
  formatMeasurement,
  formatShortDate,
  latestByField,
  todayLocal,
} from "@/lib/measurements";
import { MeasureSheet } from "./MeasureSheet";
import { ChevronRight, Plus, Ruler } from "lucide-react";
import { Button } from "@/components/base/button";
import { Spinner } from "@/components/base/spinner";
import { surfaceClass } from "@/components/base/surface";
import { cn } from "@/lib/utils";

const RECENT = 3;

export function MeasurementsSection() {
  const t = useTranslations("profile.measurements");
  const locale = useLocale();
  const { measurements, loading, save, remove } = useMeasurements();
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const latest = latestByField(measurements);
  const openNew = () => setSheetDate(todayLocal());

  return (
    <section id="medidas" className="mt-6 scroll-mt-6">
      <div className="flex items-center justify-between mb-2 min-h-9">
        <p className="kicker text-primary text-2xs">{t("kicker")}</p>
        {measurements.length > 0 && (
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-xl border-2 border-primary px-3 py-1.5 text-primary font-display uppercase tracking-wide text-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {t("measure")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : measurements.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-input p-5 text-center">
          <Ruler className="w-7 h-7 mx-auto text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground text-balance">
            {t("empty")}
          </p>
          <Button
            size="lg"
            type="button"
            onClick={openNew}
            className="mt-4 py-2.5 rounded-xl text-base"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {t("add")}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {MEASURE_FIELDS.map(({ key, unit }) => {
              const last = latest[key];
              return (
                <div
                  key={key}
                  className={cn(surfaceClass, "px-2 py-3 text-center")}
                >
                  <p className="kicker text-5xs text-muted-foreground">
                    {t(`fields.${key}`)}
                  </p>
                  <p className="mt-1.5 font-display font-bold text-2xl leading-none tabular-nums text-foreground">
                    {last ? last.value : "—"}
                    {last && (
                      <span className="ml-0.5 text-sm text-muted-foreground">
                        {unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-2xs text-muted-foreground">
                    {last ? formatShortDate(last.date, locale) : t("noData")}
                  </p>
                </div>
              );
            })}
          </div>

          <ul
            className={cn(
              surfaceClass,
              "mt-2 divide-y divide-border overflow-hidden",
            )}
          >
            {measurements.slice(0, RECENT).map((m) => (
              <li key={m.date}>
                <button
                  type="button"
                  onClick={() => setSheetDate(m.date)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  <span className="kicker text-3xs text-muted-foreground w-20 shrink-0">
                    {formatShortDate(m.date, locale)}
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
              {t("more", { count: measurements.length - RECENT })}
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
