import { PublishForm } from "@/components/publications/PublishForm";

export default async function PublishProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublishForm kind="PROGRAM" sourceId={id} />;
}
