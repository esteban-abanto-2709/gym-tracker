import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { heading } from "@/components/base/heading";
import { cn } from "@/lib/utils";

export function BottomSheet({
  label,
  onClose,
  className,
  style,
  inline = false,
  children,
}: {
  label: string;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
  inline?: boolean;
  children: React.ReactNode;
}) {
  const sheet = (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
      />
      <div
        role="dialog"
        aria-label={label}
        style={style}
        className={cn(
          "anchor-bottom fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[90dvh] overflow-y-auto animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
  return inline ? sheet : createPortal(sheet, document.body);
}

export function SheetHandle({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-1.5 rounded-full bg-border mx-auto mb-3",
        className,
      )}
    />
  );
}

export function SheetHeader({
  kicker,
  title,
  onClose,
}: {
  kicker?: string;
  title: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHandle />
      <div className="flex items-start justify-between">
        <div>
          {kicker && <p className="kicker text-primary text-3xs">{kicker}</p>}
          <h2
            className={heading({
              size: "sm",
              className: "text-foreground leading-none mt-1",
            })}
          >
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className={cn(
            "p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all",
            !kicker && "-mt-1",
          )}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
