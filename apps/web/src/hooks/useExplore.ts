import { useQuery } from "@tanstack/react-query";
import { exploreQuery } from "@/lib/queries";
import type {
  ExploreListItem,
  ExploreSort,
  PublicationKind,
} from "@/lib/types";

const NONE: ExploreListItem[] = [];

export function useExplore(kind: PublicationKind, sort: ExploreSort) {
  const { data = NONE, isPending } = useQuery(exploreQuery(kind, sort));
  return { items: data, loading: isPending };
}
