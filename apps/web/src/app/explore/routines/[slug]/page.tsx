import { PublicationDetail } from "@/components/publications/PublicationDetail";
import { getPublication, publicationMetadata } from "@/lib/server-api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return publicationMetadata("ROUTINE", (await params).slug);
}

export default async function ExploreRoutinePage({ params }: Props) {
  const { slug } = await params;
  return (
    <PublicationDetail
      kind="ROUTINE"
      slug={slug}
      publication={await getPublication("ROUTINE", slug)}
    />
  );
}
