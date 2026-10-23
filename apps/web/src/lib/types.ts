// Tipos centralizados del dominio Gym Tracker

export type Locale = "es" | "en";

export type Theme = "system" | "light" | "dark";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  slug: string;
  hasPassword: boolean;
  birthDate: string | null;
  exerciseLocale: Locale;
  theme: Theme;
  newsOpened: string[];
  newsSeen: string[];
}

export interface BodyMeasurement {
  date: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  heightCm: number | null;
}

export interface Equipment {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  createdById?: string | null;
  searchNames?: string[];
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
  reps: number | null;
  durationSec?: number | null;
  routineId?: string | null;
  routine?: { name: string } | null;
  setType?: SetType;
  step?: number | null;
  opinion?: string;
  createdAt: string;
}

export interface WeightRepsBlock {
  kind: "weight_reps";
  sets: number | null;
  reps: number | null;
  repsMax: number | null;
}

export interface RepsBlock {
  kind: "reps";
  sets: number | null;
  reps: number | null;
  repsMax: number | null;
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

export interface RampStep {
  reps: number | null;
  pct: number | null;
}

export interface RampBlock {
  kind: "ramp";
  steps: RampStep[];
}

export type RoutineBlock =
  WeightRepsBlock | RepsBlock | TimeBlock | WarmupBlock | RampBlock;

export type SetType = "WORKING" | "WARMUP" | "RAMP";

export interface RoutineItem {
  id?: string;
  exerciseId: string;
  exercise: {
    id: string;
    name: string;
  };
  position: number;
  blocks: RoutineBlock[];
}

export interface Routine {
  id: string;
  name: string;
  programId: string | null;
  items: RoutineItem[];
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  routines: Routine[];
  createdAt: string;
}

export type PublicationKind = "ROUTINE" | "PROGRAM";

export interface PublicationRoutine {
  id: string;
  name: string;
  position: number;
  items: RoutineItem[];
}

export interface Publication {
  id: string;
  kind: PublicationKind;
  slug: string;
  name: string;
  description: string | null;
  publishedAt: string;
  routines: PublicationRoutine[];
}

export type ExploreTab = "routines" | "programs" | "mine";
export type ExploreSort = "likes" | "copies" | "recent";

export interface ExploreSocial {
  author: { username: string; slug: string };
  likeCount: number;
  copyCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export type ExploreListItem = Omit<Publication, "routines"> &
  ExploreSocial & {
    routines: { name: string; exerciseCount: number }[];
  };

export type ExploreDetail = Publication & ExploreSocial;

export interface CopiedRoutine {
  routine: Routine;
}

export interface CopiedProgram {
  program: Program;
  activated: boolean;
}

export interface ActiveProgram {
  program: Program | null;
  nextRoutineId: string | null;
}

export interface ExerciseSession {
  date: string;
  free: boolean;
  equipmentId: string | null;
  equipment: string | null;
  sets: {
    weight: number | null;
    reps: number | null;
    durationSec: number | null;
  }[];
}

export interface ExerciseProgress {
  target: { sets: number; reps: number; repsMax: number | null } | null;
  streak: number | null;
  suggestion: "up" | "down" | null;
  sessions: ExerciseSession[];
}
