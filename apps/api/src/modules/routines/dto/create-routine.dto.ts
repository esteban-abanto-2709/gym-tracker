export class RoutineItemDto {
  exerciseId: string;
  position: number;
  targetSets?: number | null;
  targetReps?: number | null;
  isApproximation?: boolean;
}

export class CreateRoutineDto {
  name: string;
  items: RoutineItemDto[];
}
