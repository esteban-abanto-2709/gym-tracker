"use client";

import { useAuth } from "@/lib/auth-context";
import { notifyError } from "@/lib/notify";
import type { Locale } from "@/lib/types";
import { ChevronDown, Languages } from "lucide-react";

const OPTIONS: { value: Locale | ""; label: string }[] = [
  { value: "", label: "Automático (según tu celular)" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

export function LanguageRow() {
  const { user, updateMe } = useAuth();
  const current = user?.locale ?? "";

  const change = async (value: string) => {
    try {
      await updateMe({ locale: (value || null) as Locale | null });
    } catch {
      notifyError("No se pudo guardar el idioma");
    }
  };

  return (
    <label className="relative flex items-center gap-4 border-t-2 border-input px-5 py-3 cursor-pointer transition-colors focus-within:bg-muted/50 active:bg-muted">
      <div className="shrink-0 w-14 grid place-items-center text-primary">
        <Languages className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="kicker text-[0.6rem] text-muted-foreground">
          Idioma de los ejercicios
        </p>
        <p className="font-bold text-foreground truncate">
          {OPTIONS.find((o) => o.value === current)?.label}
        </p>
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        aria-label="Idioma de los ejercicios"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
