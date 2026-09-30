import { ExploreProgramDetail } from "@/components/programs/ExploreProgramDetail";

export default async function ExploreProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExploreProgramDetail programId={id} />;
}
