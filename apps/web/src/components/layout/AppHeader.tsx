import { ReactNode } from "react";
import Link from "next/link";
import { History, ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  /** Content to render on the left side (e.g. back button) */
  leftAction?: ReactNode;
  /** Content to render on the right side (e.g. history icon) */
  rightAction?: ReactNode;
  /** Title text — if omitted, shows the GYMTRACK brand logo */
  title?: string;
  /** Extra content below the header row (e.g. date pills) */
  children?: ReactNode;
  /** Whether to stick to the top on scroll */
  sticky?: boolean;
}

export function AppHeader({
  leftAction,
  rightAction,
  title,
  children,
  sticky = false,
}: AppHeaderProps) {
  return (
    <header
      className={`shrink-0 px-6 py-4 border-b border-border z-10 bg-background/50 backdrop-blur-md ${sticky ? "sticky top-0" : "relative"}`}
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          {leftAction ?? <div className="w-6" />}

          {title ? (
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          ) : (
            <h1 className="text-xl font-bold tracking-tight">
              <span className="bg-linear-to-r from-[hsl(var(--brand-gradient-start))] to-[hsl(var(--brand-gradient-end))] bg-clip-text text-transparent">
                GYM
              </span>
              <span className="text-foreground">TRACK</span>
            </h1>
          )}

          {rightAction ?? <div className="w-6" />}
        </div>
        {children}
      </div>
    </header>
  );
}

// --- Pre-built actions for convenience ---

export function BackAction({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
    </Link>
  );
}

export function HistoryAction() {
  return (
    <Link
      href="/history"
      className="text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-90"
      title="Ver Historial"
    >
      <History className="w-6 h-6" />
    </Link>
  );
}
