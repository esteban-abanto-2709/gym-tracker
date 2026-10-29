"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { routes } from "@/lib/routes";
import { myPublicationsQuery } from "@/lib/queries";
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

const TABS: ExploreTab[] = ["programs", "routines", "mine"];

const SORTS: ExploreSort[] = ["likes", "copies", "recent"];

export function ExploreBrowser({ initialTab }: { initialTab: ExploreTab }) {
  const t = useTranslations("explore");
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [sort, setSort] = useState<ExploreSort>("likes");
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const signedIn = !loading && Boolean(user);
  const mineList = useQuery({ ...myPublicationsQuery, enabled: signedIn });
  const mine =
    !loading && !user ? [] : mineList.isError ? [] : (mineList.data ?? null);

  const changeTab = (value: ExploreTab) => {
    setTab(value);
    router.replace(routes.explore(value), { scroll: false });
  };

  const hasMine = (mine?.length ?? 0) > 0;
  const tabs = TABS.filter((value) => value !== "mine" || hasMine);
  const current =
    tab === "mine" && mine !== null && !hasMine ? "programs" : tab;

  const changeMine = (items: ExploreListItem[]) => {
    queryClient.setQueryData(myPublicationsQuery.queryKey, items);
    if (items.length === 0) changeTab("programs");
  };

  return (
    <PageShell variant="history">
      <AppHeader
        leftAction={<BackAction href={routes.home()} />}
        title={t("title")}
      >
        <div
          role="tablist"
          className={cn(
            "grid gap-1 rounded-xl bg-secondary p-1",
            tabs.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {tabs.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={current === value}
              onClick={() => changeTab(value)}
              className={cn(
                "rounded-lg py-2 font-display uppercase tracking-wide transition-colors",
                current === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`tabs.${value}`)}
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
  const t = useTranslations("explore");
  const { items, loading } = useExplore(kind, sort);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SORTS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            onClick={() => onSort(value)}
            className={cn(
              "shrink-0 rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors",
              sort === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`sorts.${value}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <ExploreLoading />
      ) : items.length === 0 ? (
        <ExploreEmpty
          title={t("emptyTitle")}
          hint={t(kind === "PROGRAM" ? "emptyProgram" : "emptyRoutine")}
        />
      ) : (
        items.map((item) => <ExploreCard key={item.id} item={item} />)
      )}
    </>
  );
}
