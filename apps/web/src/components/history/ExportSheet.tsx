"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useMeasurements } from "@/hooks/useMeasurements";
import { todayLocal } from "@/lib/measurements";
import { buildExport, exportFilename, plural } from "@/lib/exportForAi";
import { notifyError } from "@/lib/notify";
import type { Workout } from "@/lib/types";
import { Copy, Download, Share, X } from "lucide-react";

const shiftDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d + days).toLocaleDateString("en-CA");
};

const localDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA");

const dateInput =
  "mt-1.5 block w-full min-w-0 appearance-none px-3 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold text-sm text-foreground text-left focus:outline-none focus:border-primary transition-all [&::-webkit-date-and-time-value]:text-left";

interface ExportSheetProps {
  workouts: Workout[];
  onClose: () => void;
}

export function ExportSheet({ workouts, onClose }: ExportSheetProps) {
  const { user } = useAuth();
  const { measurements, loading } = useMeasurements();
  const today = todayLocal();
  const firstDay = workouts.reduce(
    (min, w) => (localDay(w.createdAt) < min ? localDay(w.createdAt) : min),
    today,
  );
  const presets = [
    { label: "7 días", from: shiftDays(today, -6) },
    { label: "30 días", from: shiftDays(today, -29) },
    { label: "90 días", from: shiftDays(today, -89) },
    { label: "Todo", from: firstDay },
  ];
  const [from, setFrom] = useState(presets[1].from);
  const [to, setTo] = useState(today);

  const { markdown, stats } = useMemo(
    () =>
      buildExport({
        workouts,
        measurements,
        birthDate: user?.birthDate ?? null,
        from,
        to,
      }),
    [workouts, measurements, user?.birthDate, from, to],
  );
  const measured = measurements.filter(
    (m) => m.date >= from && m.date <= to,
  ).length;
  const filename = exportFilename(from, to);
  const file = useMemo(
    () => new File([markdown], filename, { type: "text/plain" }),
    [markdown, filename],
  );
  const shareable =
    typeof navigator !== "undefined" &&
    !!navigator.canShare?.({ files: [file] });
  const ready = !loading && stats.sets > 0;

  const share = async () => {
    if (!shareable) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }
    try {
      await navigator.share({ files: [file], title: filename });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        notifyError("No se pudo compartir el archivo");
      }
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Texto copiado");
    } catch {
      notifyError("No se pudo copiar el texto");
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
        aria-label="Exportar historial"
        className="fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[90dvh] overflow-y-auto animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-md mx-auto">
          <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3" />

          <div className="flex items-start justify-between">
            <div>
              <p className="kicker text-primary text-[0.65rem]">
                {"// para tu IA"}
              </p>
              <h2 className="font-display font-bold uppercase text-2xl text-foreground tracking-tight leading-none mt-1">
                Exportar historial
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

          <div className="mt-4 grid grid-cols-4 gap-2">
            {presets.map((p) => {
              const active = from === p.from && to === today;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setFrom(p.from);
                    setTo(today);
                  }}
                  aria-pressed={active}
                  className={`py-2 rounded-xl kicker text-[0.6rem] border-2 transition-all active:scale-95 ${
                    active
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-card border-input text-muted-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="min-w-0 block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                Desde
              </span>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => e.target.value && setFrom(e.target.value)}
                className={dateInput}
              />
            </label>
            <label className="min-w-0 block">
              <span className="kicker text-[0.6rem] text-muted-foreground">
                Hasta
              </span>
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => e.target.value && setTo(e.target.value)}
                className={dateInput}
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3">
            {stats.sets > 0 ? (
              <>
                <p className="font-display font-bold uppercase text-3xl leading-none text-foreground tabular-nums">
                  {plural(stats.sets, "serie", "series")}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {[
                    plural(stats.days, "día", "días"),
                    plural(stats.exercises, "ejercicio", "ejercicios"),
                    measured > 0 && plural(measured, "medida", "medidas"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                Sin series en este rango.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={share}
            disabled={!ready}
            className="mt-5 w-full py-3.5 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
          >
            {shareable ? (
              <Share className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <Download className="w-5 h-5" strokeWidth={2.5} />
            )}
            {shareable ? "Compartir" : "Descargar"}
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={!ready}
            className="mt-1 w-full py-2.5 text-muted-foreground hover:text-foreground font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Copy className="w-4 h-4" />
            Copiar texto
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
