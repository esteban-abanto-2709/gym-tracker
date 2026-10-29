import { ExploreBrowser } from "@/components/publications/ExploreBrowser";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ExploreTab } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("explore");
  return { title: t("title"), description: t("description") };
}

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
