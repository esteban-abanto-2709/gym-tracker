export class RoutineItemDto {
  exerciseId: string;
  position: number;
  targetSets?: number | null;
  targetReps?: number | null;
}

export class CreateRoutineDto {
  name: string;
  items: RoutineItemDto[];
}
