import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  variant?: "default" | "history";
}

/**
 * Wrapper compartido para todas las páginas.
 * Incluye el background pattern + gradient orb(s) decorativos.
 */
export function PageShell({ children, variant = "default" }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              var(--foreground) 35px,
              var(--foreground) 36px
            )`,
          }}
        />
      </div>

      {/* Gradient Orb(s) */}
      {variant === "history" ? (
        <>
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), transparent)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, hsl(var(--brand-gradient-end)), transparent)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(--brand-gradient-start)), hsl(var(--brand-gradient-end)))`,
          }}
        />
      )}

      {children}
    </div>
  );
}
