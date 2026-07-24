// Tipos centralizados del dominio Gym Tracker

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  slug: string;
}

export interface Equipment {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
}

export interface Workout {
  id: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
  };
  equipmentId?: string | null;
  equipment?: Equipment | null;
  weight: number;
  reps: number;
  opinion: string;
  isApproximation?: boolean;
  routineId?: string | null;
  createdAt: string;
}

export interface RoutineItem {
  id?: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
  };
  position: number;
  targetSets: number | null;
  targetReps: number | null;
  isApproximation?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
  createdAt: string;
}
