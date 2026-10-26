"use client";

import { Flag, PartyPopper, Plus } from "lucide-react";

interface SetDoneScreenProps {
  onExtraSet: () => void;
  onFinish: () => void;
}

export function SetDoneScreen({ onExtraSet, onFinish }: SetDoneScreenProps) {
  return (
    <main className="flex-1 flex flex-col px-6 py-8 relative z-10 animate-fade-in-up">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <PartyPopper className="w-12 h-12 text-primary" />
          <p className="mt-3 font-display font-bold uppercase text-4xl text-foreground tracking-tight">
            ¡Rutina completada!
          </p>
        </div>

        <div className="space-y-3 pt-6">
          <button
            type="button"
            onClick={onFinish}
            className="w-full py-4 bg-linear-to-r from-brand-start to-brand-end text-primary-foreground rounded-2xl font-display uppercase tracking-wide text-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            Terminar sesión
          </button>
          <button
            type="button"
            onClick={onExtraSet}
            className="w-full py-4 rounded-2xl bg-secondary text-foreground font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Una serie extra
          </button>
        </div>
      </div>
    </main>
  );
}
