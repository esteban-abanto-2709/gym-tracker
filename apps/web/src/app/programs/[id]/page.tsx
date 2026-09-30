import { ProgramEditor } from "@/components/programs/ProgramEditor";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProgramEditor programId={id} />;
}
