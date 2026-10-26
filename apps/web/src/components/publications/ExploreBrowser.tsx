"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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
import { ExploreCard, ExploreEmpty, ExploreLoading } from "./ExploreCard";
import { MyPublications } from "./MyPublications";
import { cn } from "@/lib/utils";

const TABS: { value: ExploreTab; label: string }[] = [
  { value: "programs", label: "Programas" },
  { value: "routines", label: "Rutinas" },
  { value: "mine", label: "Mías" },
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
  const [fetchedMine, setMine] = useState<ExploreListItem[] | null>(null);
  const { user, loading } = useAuth();
  const userId = user?.id;
  const mine = !loading && !userId ? [] : fetchedMine;

  useEffect(() => {
    if (loading || !userId) return;
    api
      .get<ExploreListItem[]>(routes.api.publications.mine())
      .then(setMine)
      .catch((e) => {
        console.error("Error fetching my publications:", e);
        setMine([]);
      });
  }, [loading, userId]);

  const changeTab = (value: ExploreTab) => {
    setTab(value);
    router.replace(routes.explore(value), { scroll: false });
  };

  const hasMine = (mine?.length ?? 0) > 0;
  const tabs = TABS.filter((t) => t.value !== "mine" || hasMine);
  const current =
    tab === "mine" && mine !== null && !hasMine ? "programs" : tab;

  const changeMine = (items: ExploreListItem[]) => {
    setMine(items);
    if (items.length === 0) changeTab("programs");
  };

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title="Explorar"
      >
        <div
          role="tablist"
          className={cn(
            "grid gap-1 rounded-xl bg-secondary p-1",
            tabs.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={current === t.value}
              onClick={() => changeTab(t.value)}
              className={cn(
                "rounded-lg py-2 font-display uppercase tracking-wide transition-colors",
                current === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </AppHeader>

      <main className="flex-1 px-6 py-6 relative z-10 animate-fade-in-up">
        <div className="max-w-md mx-auto space-y-3">
          {current === "mine" ? (
            mine === null ? (
              <ExploreLoading />
            ) : (
              <MyPublications items={mine} onChange={changeMine} />
            )
          ) : (
            <PublicList
              kind={current === "programs" ? "PROGRAM" : "ROUTINE"}
              sort={sort}
              onSort={setSort}
            />
          )}
        </div>
      </main>
    </PageShell>
  );
}

function PublicList({
  kind,
  sort,
  onSort,
}: {
  kind: PublicationKind;
  sort: ExploreSort;
  onSort: (sort: ExploreSort) => void;
}) {
  const { items, loading } = useExplore(kind, sort);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-pressed={sort === s.value}
            onClick={() => onSort(s.value)}
            className={cn(
              "shrink-0 rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors",
              sort === s.value
                ? "border-foreground bg-foreground text-background"
                : "border-input text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ExploreLoading />
      ) : items.length === 0 ? (
        <ExploreEmpty
          title="Nada publicado aún"
          hint={
            kind === "PROGRAM"
              ? "Publica un programa desde su editor, con el ícono del globo."
              : "Publica una rutina desde su editor, con el ícono del globo."
          }
        />
      ) : (
        items.map((item) => <ExploreCard key={item.id} item={item} />)
      )}
    </>
  );
}
