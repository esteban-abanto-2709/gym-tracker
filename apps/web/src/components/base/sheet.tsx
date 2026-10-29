import * as React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { heading } from "@/components/base/heading";
import { cn } from "@/lib/utils";

export const SheetTitle = Dialog.Title;

export function BottomSheet({
  label,
  onClose,
  className,
  style,
  children,
}: {
  label: string;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 animate-fade-in" />
        <Dialog.Content
          ref={contentRef}
          aria-label={label}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          style={style}
          className={cn(
            "anchor-bottom fixed left-0 right-0 bottom-0 z-50 bg-card rounded-t-3xl border-t-2 border-border max-h-[90dvh] overflow-y-auto animate-sheet-up px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] outline-none",
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
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
  const t = useTranslations("common");
  return (
    <>
      <SheetHandle />
      <div className="flex items-start justify-between">
        <div>
          {kicker && <p className="kicker text-primary text-3xs">{kicker}</p>}
          <SheetTitle
            className={heading({
              size: "sm",
              className: "text-foreground leading-none mt-1",
            })}
          >
            {title}
          </SheetTitle>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
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
