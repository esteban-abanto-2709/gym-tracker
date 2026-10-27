import {
  queryOptions,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type {
  ActiveProgram,
  BodyMeasurement,
  Equipment,
  Exercise,
  Program,
  Routine,
} from "@/lib/types";

export const equipmentQuery = queryOptions({
  queryKey: ["equipment"],
  queryFn: () => api.get<Equipment[]>(routes.api.equipment.list()),
  meta: { errorMessage: "No se pudieron cargar los equipos" },
});

export const exercisesQuery = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => api.get<Exercise[]>(routes.api.exercises.list()),
  meta: { errorMessage: "No se pudieron cargar los ejercicios" },
});

export const routinesQuery = queryOptions({
  queryKey: ["routines"],
  queryFn: () => api.get<Routine[]>(routes.api.routines.list()),
  meta: { errorMessage: "No se pudieron cargar tus rutinas" },
});

export const programsQuery = queryOptions({
  queryKey: ["programs"],
  queryFn: () => api.get<Program[]>(routes.api.programs.list()),
  meta: { errorMessage: "No se pudieron cargar tus programas" },
});

export const activeProgramQuery = queryOptions({
  queryKey: ["programs", "active"],
  queryFn: () => api.get<ActiveProgram>(routes.api.programs.active()),
  meta: { errorMessage: "No se pudo cargar tu programa activo" },
});

export const measurementsQuery = queryOptions({
  queryKey: ["measurements"],
  queryFn: () => api.get<BodyMeasurement[]>(routes.api.measurements.list()),
  meta: { errorMessage: "No se pudieron cargar tus medidas" },
});

export const refetchAll = (
  client: QueryClient,
  ...queries: { queryKey: QueryKey }[]
) =>
  Promise.all(
    queries.map(({ queryKey }) =>
      client.invalidateQueries({ queryKey, refetchType: "all" }),
    ),
  );
