import { PublicationDetail } from "@/components/publications/PublicationDetail";

export default async function ExploreRoutinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicationDetail kind="ROUTINE" slug={slug} />;
}
