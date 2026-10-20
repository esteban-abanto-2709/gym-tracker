import { PublishForm } from "@/components/publications/PublishForm";

export default async function PublishRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublishForm kind="ROUTINE" sourceId={id} />;
}
