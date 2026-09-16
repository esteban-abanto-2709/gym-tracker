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
  isTimed?: boolean;
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
  weight: number | null;
  reps: number;
  durationSec?: number | null;
  opinion: string;
  isApproximation?: boolean;
  routineId?: string | null;
  createdAt: string;
}

export interface LegacyBlock {
  kind: "legacy";
  sets: number | null;
  reps: number | null;
  durationSec: number | null;
  approx: boolean;
}

export interface WeightRepsBlock {
  kind: "weight_reps";
  sets: number | null;
  reps: number | null;
  approx: boolean;
}

export interface RepsBlock {
  kind: "reps";
  sets: number | null;
  reps: number | null;
}

export interface TimeBlock {
  kind: "time";
  sets: number | null;
  durationSec: number | null;
}

export interface WarmupBlock {
  kind: "warmup";
  sets: number | null;
  reps: number | null;
}

export type RoutineBlock =
  | LegacyBlock
  | WeightRepsBlock
  | RepsBlock
  | TimeBlock
  | WarmupBlock;

export type SetType = "WORKING" | "WARMUP";

export interface RoutineItem {
  id?: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
    isTimed?: boolean;
  };
  position: number;
  blocks: RoutineBlock[];
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
  createdAt: string;
}
