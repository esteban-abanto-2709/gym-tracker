"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ageOn, formatShortDate, todayLocal } from "@/lib/measurements";
import { notifyError } from "@/lib/notify";
import { Cake, Pencil } from "lucide-react";

export function BirthDateRow() {
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
      notifyError("No se pudo guardar tu fecha de nacimiento");
    }
  };

  return (
    <label className="relative flex items-center gap-4 border-t-2 border-input px-5 py-3 cursor-pointer transition-colors focus-within:bg-muted/50 active:bg-muted">
      <div className="shrink-0 w-14 grid place-items-center text-primary">
        <Cake className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="kicker text-[0.6rem] text-muted-foreground">Nacimiento</p>
        <p className="font-bold text-foreground truncate">
          {draft
            ? `${formatShortDate(draft)} · ${ageOn(draft)} años`
            : "Agregar"}
        </p>
      </div>
      <Pencil className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="date"
        value={draft}
        max={todayLocal()}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        onBlur={commit}
        aria-label="Fecha de nacimiento"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </label>
  );
}
