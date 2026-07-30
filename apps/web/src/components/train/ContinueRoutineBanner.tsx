"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  type ActiveSession,
  readActiveSession,
} from "@/lib/activeSession";

export function ContinueRoutineBanner() {
  const [session, setSession] = useState<ActiveSession | null>(null);

  // Read on mount only (localStorage is client-side; avoids hydration mismatch)
  useEffect(() => {
    setSession(readActiveSession());
  }, []);

  if (!session) return null;

  return (
    <Link
      href={routes.train()}
      className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-primary bg-card shadow-lg shadow-primary/10 active:scale-[0.98] transition-all animate-fade-in"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-3 h-3 rounded-full bg-primary animate-pulse-red" />
        <div className="min-w-0">
          <p className="kicker text-primary text-[0.6rem] truncate">
            En curso · {session.routineName}
          </p>
          <p className="font-display font-bold uppercase text-foreground text-xl leading-none mt-1.5">
            Continuar donde lo dejaste
          </p>
        </div>
      </div>
      <span className="shrink-0 font-display text-2xl text-primary">→</span>
    </Link>
  );
}
