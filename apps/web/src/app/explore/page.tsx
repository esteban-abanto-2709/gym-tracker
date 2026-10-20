import { ExploreBrowser } from "@/components/publications/ExploreBrowser";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <ExploreBrowser initialTab={tab === "routines" ? "routines" : "programs"} />
  );
}
