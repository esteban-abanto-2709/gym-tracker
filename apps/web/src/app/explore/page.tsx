import { ExploreBrowser } from "@/components/publications/ExploreBrowser";
import type { ExploreTab } from "@/lib/types";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: ExploreTab =
    tab === "routines" || tab === "mine" ? tab : "programs";
  return <ExploreBrowser initialTab={initialTab} />;
}
