"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { NEWS, type NewsItem } from "@/lib/news";

export function NewsButton() {
  const { user, updateMe } = useAuth();
  const [opened, setOpened] = useState(user?.newsOpened ?? []);
  const [seen, setSeen] = useState(user?.newsSeen ?? []);
  const [open, setOpen] = useState(false);
  const hasUnopened = NEWS.some((n) => !opened.includes(n.id));

  const openSheet = () => {
    setOpen(true);
    if (!hasUnopened) return;
    const next = [...new Set([...opened, ...NEWS.map((n) => n.id)])];
    setOpened(next);
    updateMe({ newsOpened: next }).catch(() => {});
  };

  const markSeen = (id: string) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    updateMe({ newsSeen: next }).catch(() => {});
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label={hasUnopened ? "Novedades, hay algo nuevo" : "Novedades"}
        className="relative p-2 -m-2 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
      >
        <Sparkles className="w-6 h-6" />
        {hasUnopened && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse-red" />
        )}
      </button>

      {open && (
        <NewsSheet
          seen={seen}
          onSeen={markSeen}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NewsSheet({
  seen,
  onSeen,
  onClose,
}: {
  seen: string[];
  onSeen: (id: string) => void;
  onClose: () => void;
}) {
  const [initialSeen] = useState(seen);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fresh = NEWS.filter((n) => !initialSeen.includes(n.id));
  const old = NEWS.filter((n) => initialSeen.includes(n.id));

  const toggle = (id: string) => {
    setExpanded(expanded === id ? null : id);
    onSeen(id);
  };

  const card = (item: NewsItem) => (
    <NewsCard
      key={item.id}
      item={item}
      isNew={!seen.includes(item.id)}
      expanded={expanded === item.id}
      onToggle={() => toggle(item.id)}
      onGo={onClose}
    />
  );

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/55 animate-fade-in"
      />

      <div
        role="dialog"
        aria-label="Novedades"
        className="anchor-bottom fixed left-0 right-0 bottom-0 z-50 flex flex-col bg-card rounded-t-3xl border-t-2 border-border max-h-[85dvh] animate-sheet-up"
      >
        <div className="shrink-0 px-5 pt-3 pb-4 border-b border-border">
          <div className="max-w-md mx-auto">
            <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-3" />

            <div className="flex items-start justify-between">
              <div>
                <p className="kicker text-primary text-3xs">
                  {"// lo que puedes hacer"}
                </p>
                <h2 className="font-display font-bold uppercase text-2xl text-foreground tracking-tight leading-none mt-1">
                  Novedades
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto">
            {fresh.length > 0 && (
              <div className="grid gap-2">{fresh.map(card)}</div>
            )}

            {old.length > 0 && (
              <>
                <p
                  className={`${fresh.length > 0 ? "mt-6" : ""} mb-2 kicker text-4xs text-muted-foreground`}
                >
                  Ya vistas
                </p>
                <div className="grid gap-2">{old.map(card)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function NewsCard({
  item,
  isNew,
  expanded,
  onToggle,
  onGo,
}: {
  item: NewsItem;
  isNew: boolean;
  expanded: boolean;
  onToggle: () => void;
  onGo: () => void;
}) {
  const { Icon } = item;

  return (
    <div
      className={`rounded-2xl border-2 transition-colors ${
        expanded ? "border-primary bg-primary/5" : "border-input bg-muted/40"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:scale-[0.98] transition-transform"
      >
        <span
          className={`shrink-0 w-10 h-10 rounded-xl grid place-items-center ${
            isNew
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          {isNew && (
            <span className="block kicker text-primary text-5xs">Nuevo</span>
          )}
          <span className="block font-bold text-foreground leading-snug">
            {item.title}
          </span>
        </span>
        <ChevronDown
          className={`shrink-0 w-5 h-5 text-muted-foreground transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground text-pretty">
              {item.body}
            </p>
            {item.href && (
              <Link
                href={item.href}
                onClick={onGo}
                tabIndex={expanded ? 0 : -1}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 font-display font-bold uppercase tracking-wide active:scale-[0.98] transition-transform"
              >
                Ir
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
