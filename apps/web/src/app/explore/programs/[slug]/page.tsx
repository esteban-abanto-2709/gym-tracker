import { PublicationDetail } from "@/components/publications/PublicationDetail";
import { getPublication, publicationMetadata } from "@/lib/server-api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return publicationMetadata("PROGRAM", (await params).slug);
}

export default async function ExploreProgramPage({ params }: Props) {
  const { slug } = await params;
  return (
    <PublicationDetail
      kind="PROGRAM"
      slug={slug}
      publication={await getPublication("PROGRAM", slug)}
    />
  );
}
