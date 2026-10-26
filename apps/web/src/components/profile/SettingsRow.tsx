import type { ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export const settingsRowClass =
  "w-full text-left flex items-center gap-4 border-t-2 border-input px-5 py-3 transition-colors active:bg-muted";

export function SettingsRowContent({
  Icon,
  label,
  value,
  Trailing = ChevronRight,
}: {
  Icon: LucideIcon;
  label: string;
  value: ReactNode;
  Trailing?: LucideIcon;
}) {
  return (
    <>
      <div className="shrink-0 w-14 grid place-items-center text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="kicker text-4xs text-muted-foreground">{label}</p>
        <p className="font-bold text-foreground truncate">{value}</p>
      </div>
      <Trailing className="w-4 h-4 text-muted-foreground shrink-0" />
    </>
  );
}
