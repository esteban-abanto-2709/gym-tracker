import { PublicationDetail } from "@/components/publications/PublicationDetail";

export default async function ExploreProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicationDetail kind="PROGRAM" slug={slug} />;
}
