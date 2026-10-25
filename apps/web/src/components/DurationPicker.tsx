"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import "@ncdai/react-wheel-picker/style.css";
import { Check, Pencil, X } from "lucide-react";
import { formatClock } from "@/lib/setDisplay";

const range = (count: number): WheelPickerOption<number>[] =>
  Array.from({ length: count }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, "0"),
  }));

const MINUTES = range(60);
const SECONDS = range(60);

const wheelClassNames = {
  optionItem: "text-muted-foreground font-mono text-xl",
  highlightWrapper: "bg-muted rounded-xl",
  highlightItem: "text-primary font-mono text-xl font-bold",
};

const toSeconds = (value: string) =>
  Math.max(0, Math.floor(Number(value) || 0));

interface DurationPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

function WheelColumn({
  options,
  value,
  onChange,
  unit,
  infinite,
}: {
  options: WheelPickerOption<number>[];
  value: number;
  onChange: (value: number) => void;
  unit: string;
  infinite?: boolean;
}) {
  return (
    <div className="relative flex-1">
      <WheelPicker
        options={options}
        value={value}
        onValueChange={onChange}
        optionItemHeight={44}
        visibleCount={16}
        infinite={infinite}
        classNames={wheelClassNames}
      />
      <span className="pointer-events-none absolute top-1/2 left-1/2 ml-7 -translate-y-1/2 kicker text-[0.6rem] text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

export function DurationPicker({
  value,
  onChange,
  label = "Duración",
}: DurationPickerProps) {
  const total = toSeconds(value);
  const minutes = Math.min(59, Math.floor(total / 60));
  const seconds = total % 60;

  const update = (nextMinutes: number, nextSeconds: number) =>
    onChange(String(nextMinutes * 60 + nextSeconds));

  return (
    <div role="group" aria-label={label}>
      <span className="sr-only" aria-live="polite">
        {minutes} min {seconds} s
      </span>
      <WheelPickerWrapper className="gap-3">
        <WheelColumn
          options={MINUTES}
          value={minutes}
          onChange={(m) => update(m, seconds)}
          unit="min"
        />
        <WheelColumn
          options={SECONDS}
          value={seconds}
          onChange={(s) => update(minutes, s)}
          unit="seg"
          infinite
        />
      </WheelPickerWrapper>
    </div>
  );
}

const FIELD_CLASS = {
  lg: "relative w-full px-4 py-4 text-2xl bg-card border-2 border-input rounded-2xl text-center font-mono text-foreground hover:border-primary/50 active:scale-[0.98] transition-all",
  sm: "min-w-14 px-2 py-2 text-center font-mono bg-muted border-2 border-transparent hover:border-primary/50 rounded-xl transition-all",
};

interface DurationFieldProps extends DurationPickerProps {
  size?: keyof typeof FIELD_CLASS;
}

export function DurationField({
  value,
  onChange,
  label = "Duración",
  size = "lg",
}: DurationFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const total = toSeconds(value);

  const close = () => setDraft(null);
  const confirm = () => {
    if (draft !== null) onChange(draft);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDraft(String(total))}
        aria-label={`${label}: ${total > 0 ? formatClock(total) : "sin tiempo"}. Cambiar`}
        className={FIELD_CLASS[size]}
      >
        {total > 0 ? formatClock(total) : "—"}
        {size === "lg" && (
          <Pencil className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {draft !== null &&
        createPortal(
          <>
            <div
              onClick={close}
              className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
            />
            <div
              role="dialog"
              aria-label={label}
              className="anchor-bottom fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            >
              <div className="max-w-md mx-auto">
                <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3" />

                <div className="flex items-start justify-between">
                  <h2 className="font-display font-bold uppercase text-2xl text-foreground tracking-tight leading-none mt-1">
                    {label}
                  </h2>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar"
                    className="p-2 -mr-2 -mt-1 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="mt-4 text-center font-display font-bold text-6xl text-primary tabular-nums leading-none">
                  {formatClock(toSeconds(draft))}
                </p>

                <div className="mt-4">
                  <DurationPicker
                    value={draft}
                    onChange={setDraft}
                    label={label}
                  />
                </div>

                <button
                  type="button"
                  onClick={confirm}
                  disabled={toSeconds(draft) === 0}
                  className="mt-5 w-full py-4 bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-6 h-6" strokeWidth={3} />
                  Listo
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
