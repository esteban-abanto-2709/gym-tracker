"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  type ActiveSession,
  readActiveSession,
  totalSetsDone,
} from "@/lib/activeSession";
import { Play } from "lucide-react";

export function ContinueRoutineBanner() {
  const [session, setSession] = useState<ActiveSession | null>(null);

  // Read on mount only (localStorage is client-side; avoids hydration mismatch)
  useEffect(() => {
    setSession(readActiveSession());
  }, []);

  if (!session) return null;

  const done = totalSetsDone(session.progress);

  return (
    <Link
      href={routes.train()}
      className="flex items-center gap-3 p-3 rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/10 active:scale-[0.98] transition-all animate-fade-in"
    >
      <div className="shrink-0 p-2.5 bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] rounded-xl text-primary-foreground">
        <Play className="w-5 h-5" strokeWidth={3} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black text-primary uppercase tracking-wide">
          Rutina en curso
        </p>
        <p className="font-bold text-foreground leading-tight truncate">
          Continuar {session.routineName}
        </p>
      </div>
      <span className="shrink-0 text-xs font-bold text-muted-foreground">
        {done} {done === 1 ? "serie" : "series"}
      </span>
    </Link>
  );
}
