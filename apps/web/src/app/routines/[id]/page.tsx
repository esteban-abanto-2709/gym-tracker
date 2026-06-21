import { RoutineEditor } from "@/components/routines/RoutineEditor";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoutineEditor routineId={id} />;
}
