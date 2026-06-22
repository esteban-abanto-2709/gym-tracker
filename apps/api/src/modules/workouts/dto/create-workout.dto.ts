export class CreateWorkoutDto {
  exerciseId: string;
  reps: number;
  weight: number;
  opinion?: string;
  routineId?: string;
}
