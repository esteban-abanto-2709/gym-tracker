import type { SaveFlash } from "@/hooks/useGuidedSession";
import { ArrowRight, Check } from "lucide-react";

export function SaveOverlay({ flash }: { flash: SaveFlash }) {
  return (
    <div
      role="status"
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 bg-background/90 ${
        flash.leaving ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-md w-full animate-rise-in">
        <div className="relative w-24 h-24">
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
          <div
            className={`relative w-24 h-24 rounded-full bg-linear-to-br from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] flex items-center justify-center shadow-lg shadow-primary/40 ${
              flash.saved ? "animate-pop" : "opacity-50"
            }`}
          >
            {flash.saved && (
              <Check
                className="w-12 h-12 text-primary-foreground"
                strokeWidth={3.5}
              />
            )}
          </div>
        </div>

        <p className="mt-6 font-display font-bold uppercase text-4xl text-foreground leading-tight tracking-tight">
          {flash.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground font-mono truncate max-w-full">
          {flash.detail}
        </p>

        <div className="mt-8 h-8">
          {flash.next && (
            <div className="flex items-center gap-2 animate-rise-in">
              <ArrowRight className="w-5 h-5 text-primary" strokeWidth={2.5} />
              <span className="font-display font-bold uppercase text-2xl text-primary leading-tight">
                {flash.next}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
