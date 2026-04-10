// Tipos centralizados del dominio Gym Tracker

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
  createdAt: string;
}
