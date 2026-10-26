import { ExploreBrowser } from "@/components/publications/ExploreBrowser";
import type { Metadata } from "next";
import type { ExploreTab } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explorar",
  description:
    "Rutinas y programas de entrenamiento publicados por la comunidad de Gym Tracker. Cópialos y entrena.",
};

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
