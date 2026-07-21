// Tipos centralizados del dominio Gym Tracker

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  slug: string;
}

export type Equipment =
  | "Sin asignar"
  | "Barra"
  | "Polea"
  | "Mancuerna"
  | "Máquina"
  | "Peso Corporal"
  | "Otro";

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  description?: string;
  createdAt?: string;
}

export interface Workout {
  id: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    equipment: string;
  };
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
    equipment: string;
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
