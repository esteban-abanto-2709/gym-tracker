"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useMeasurements } from "@/hooks/useMeasurements";
import { todayLocal } from "@/lib/measurements";
import { buildExport, exportFilename, plural } from "@/lib/exportForAi";
import { notifyError } from "@/lib/notify";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Workout } from "@/lib/types";
import { Copy, Download, Share } from "lucide-react";
import { Button } from "@/components/base/button";
import { heading } from "@/components/base/heading";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";
import { cn } from "@/lib/utils";

const shiftDays = (date: string, days: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d + days).toLocaleDateString("en-CA");
};

const dateInput =
  "mt-1.5 block w-full min-w-0 appearance-none px-3 py-2.5 bg-muted border-2 border-transparent rounded-xl font-bold text-sm text-foreground text-left focus:outline-none focus:border-primary transition-all [&::-webkit-date-and-time-value]:text-left";

interface ExportSheetProps {
  firstDay: string;
  onClose: () => void;
}

export function ExportSheet({ firstDay, onClose }: ExportSheetProps) {
  const { user } = useAuth();
  const { measurements, loading } = useMeasurements();
  const today = todayLocal();
  const presets = [
    { label: "7 días", from: shiftDays(today, -6) },
    { label: "30 días", from: shiftDays(today, -29) },
    { label: "90 días", from: shiftDays(today, -89) },
    { label: "Todo", from: firstDay },
  ];
  const [from, setFrom] = useState(presets[1].from);
  const [to, setTo] = useState(today);
  const [fetched, setFetched] = useState<{
    key: string;
    workouts: Workout[];
  } | null>(null);
  const rangeKey = `${from}_${to}`;
  const workouts = fetched?.key === rangeKey ? fetched.workouts : null;

  useEffect(() => {
    api
      .get<Workout[]>(routes.api.workouts.range(from, to))
      .then((sets) => setFetched({ key: `${from}_${to}`, workouts: sets }))
      .catch(() => notifyError("No se pudo cargar el historial"));
  }, [from, to]);

  const { markdown, stats } = useMemo(
    () =>
      buildExport({
        workouts: workouts ?? [],
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
  const ready = !loading && workouts !== null && stats.sets > 0;

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

  return (
    <BottomSheet label="Exportar historial" onClose={onClose}>
      <div className="max-w-md mx-auto">
        <SheetHeader
          kicker="// para tu IA"
          title="Exportar historial"
          onClose={onClose}
        />

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
                className={cn(
                  "py-2 rounded-xl kicker text-4xs border-2 transition-all active:scale-95",
                  active
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border-input text-muted-foreground",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="min-w-0 block">
            <span className="kicker text-4xs text-muted-foreground">Desde</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => e.target.value && setFrom(e.target.value)}
              className={dateInput}
            />
          </label>
          <label className="min-w-0 block">
            <span className="kicker text-4xs text-muted-foreground">Hasta</span>
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
          {workouts === null ? (
            <p className="py-2 text-sm text-muted-foreground">Cargando…</p>
          ) : stats.sets > 0 ? (
            <>
              <p
                className={heading({
                  className:
                    "text-3xl leading-none text-foreground tabular-nums",
                })}
              >
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

        <Button
          type="button"
          onClick={share}
          disabled={!ready}
          className="mt-5 py-3.5 disabled:opacity-40"
        >
          {shareable ? (
            <Share className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Download className="w-5 h-5" strokeWidth={2.5} />
          )}
          {shareable ? "Compartir" : "Descargar"}
        </Button>
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
    </BottomSheet>
  );
}
