import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { heading } from "@/components/base/heading";

interface StatusScreenProps {
  icon: LucideIcon;
  kicker: string;
  title: string;
  message: string;
  children: React.ReactNode;
}

export function StatusScreen({
  icon: Icon,
  kicker,
  title,
  message,
  children,
}: StatusScreenProps) {
  return (
    <PageShell>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10 text-center animate-fade-in-up">
        <div className="max-w-md w-full space-y-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-brand-start to-brand-end rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Icon className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <p className="kicker text-primary text-4xs">{kicker}</p>
              <h1
                className={heading({
                  size: "lg",
                  className: "text-foreground",
                })}
              >
                {title}
              </h1>
              <p className="text-muted-foreground text-lg">{message}</p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </PageShell>
  );
}
