import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type {
  ExploreListItem,
  ExploreSort,
  PublicationKind,
} from "@/lib/types";

export function useExplore(kind: PublicationKind, sort: ExploreSort) {
  const key = `${kind}:${sort}`;
  const [result, setResult] = useState<{
    key: string;
    items: ExploreListItem[];
  } | null>(null);

  useEffect(() => {
    let current = true;
    api
      .get<ExploreListItem[]>(routes.api.explore.list(kind, sort))
      .then((items) => {
        if (current) setResult({ key: `${kind}:${sort}`, items });
      })
      .catch((e) => {
        console.error("Error fetching explore:", e);
        if (current) setResult({ key: `${kind}:${sort}`, items: [] });
      });
    return () => {
      current = false;
    };
  }, [kind, sort]);

  const fresh = result?.key === key;
  return { items: fresh ? result.items : [], loading: !fresh };
}
