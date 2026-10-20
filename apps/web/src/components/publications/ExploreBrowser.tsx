"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import type {
  ExploreListItem,
  ExploreSort,
  ExploreTab,
  PublicationKind,
} from "@/lib/types";
import { useExplore } from "@/hooks/useExplore";
import { PageShell } from "@/components/layout/PageShell";
import { AppHeader, BackAction } from "@/components/layout/AppHeader";
import { AuthorName } from "./AuthorName";
import { ChevronRight, Compass, Copy, Heart, Loader2 } from "lucide-react";

const TABS: { value: ExploreTab; label: string; kind: PublicationKind }[] = [
  { value: "programs", label: "Programas", kind: "PROGRAM" },
  { value: "routines", label: "Rutinas", kind: "ROUTINE" },
];

const SORTS: { value: ExploreSort; label: string }[] = [
  { value: "likes", label: "Populares" },
  { value: "copies", label: "Más copiados" },
  { value: "recent", label: "Recientes" },
];

export function ExploreBrowser({ initialTab }: { initialTab: ExploreTab }) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [sort, setSort] = useState<ExploreSort>("likes");
  const kind = TABS.find((t) => t.value === tab)!.kind;
  const { items, loading } = useExplore(kind, sort);

  const changeTab = (value: ExploreTab) => {
    setTab(value);
    router.replace(routes.explore(value), { scroll: false });
  };

  return (
    <PageShell variant="history">
      <AppHeader leftAction={<BackAction href={routes.home()} />} title="Explorar">
        <div
          role="tablist"
          className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => changeTab(t.value)}
              className={`rounded-lg py-2 font-display uppercase tracking-wide transition-colors ${
                tab === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </AppHeader>

      <main className="flex-1 px-6 py-6 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={sort === s.value}
                onClick={() => setSort(s.value)}
                className={`shrink-0 rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors ${
                  sort === s.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6 text-muted-foreground">
              <Compass className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-display font-bold uppercase text-foreground text-2xl tracking-tight">
                Nada publicado aún
              </p>
              <p className="text-sm opacity-70">
                {kind === "PROGRAM"
                  ? "Publica un programa desde su editor, con el ícono del globo."
                  : "Publica una rutina desde su editor, con el ícono del globo."}
              </p>
            </div>
          ) : (
            items.map((item) => <ExploreCard key={item.id} item={item} />)
          )}
        </div>
      </main>
    </PageShell>
  );
}

function ExploreCard({ item }: { item: ExploreListItem }) {
  const isProgram = item.kind === "PROGRAM";
  const exercises = item.routines[0]?.exerciseCount ?? 0;

  return (
    <Link
      href={routes.explorePublication(item.kind, item.slug)}
      className="flex items-center gap-3 rounded-2xl border-2 border-input bg-card p-4 hover:border-primary/50 active:scale-[0.98] transition-all"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="min-w-0 truncate font-bold text-foreground text-lg leading-tight">
            {item.name}
          </span>
          {item.isMine && (
            <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 kicker text-[0.55rem] text-muted-foreground">
              Tuya
            </span>
          )}
        </span>
        <span className="block kicker text-[0.6rem] text-muted-foreground mt-1.5">
          de <AuthorName author={item.author} /> ·{" "}
          {isProgram
            ? `${item.routines.length} ${item.routines.length === 1 ? "rutina" : "rutinas"}`
            : `${exercises} ${exercises === 1 ? "ejercicio" : "ejercicios"}`}
        </span>
        {isProgram && (
          <span className="block text-xs text-muted-foreground truncate mt-1">
            {item.routines.map((r) => r.name).join(" → ")}
          </span>
        )}
        <span className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" aria-hidden />
            <span aria-label="me gusta">{item.likeCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" aria-hidden />
            <span aria-label="copias">{item.copyCount}</span>
          </span>
        </span>
      </span>
      <ChevronRight className="shrink-0 w-5 h-5 text-muted-foreground" />
    </Link>
  );
}
