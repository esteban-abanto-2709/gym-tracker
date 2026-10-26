"use client";

import { useState } from "react";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import "@ncdai/react-wheel-picker/style.css";
import { Check, Pencil } from "lucide-react";
import { formatClock } from "@/lib/setDisplay";
import { Button } from "@/components/base/button";
import { BottomSheet, SheetHeader } from "@/components/base/sheet";

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
      <span className="pointer-events-none absolute top-1/2 left-1/2 ml-7 -translate-y-1/2 kicker text-4xs text-muted-foreground">
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

      {draft !== null && (
        <BottomSheet
          label={label}
          onClose={close}
          className="max-h-none overflow-visible"
        >
          <div className="max-w-md mx-auto">
            <SheetHeader title={label} onClose={close} />

            <p className="mt-4 text-center font-display font-bold text-6xl text-primary tabular-nums leading-none">
              {formatClock(toSeconds(draft))}
            </p>

            <div className="mt-4">
              <DurationPicker value={draft} onChange={setDraft} label={label} />
            </div>

            <Button
              type="button"
              onClick={confirm}
              disabled={toSeconds(draft) === 0}
              className="mt-5"
            >
              <Check className="w-6 h-6" strokeWidth={3} />
              Listo
            </Button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
