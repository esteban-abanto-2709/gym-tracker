import {
  infiniteQueryOptions,
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
  ExploreListItem,
  ExploreSort,
  Program,
  PublicationKind,
  Routine,
  SessionPage,
  Workout,
} from "@/lib/types";

export const equipmentQuery = queryOptions({
  queryKey: ["equipment"],
  queryFn: () => api.get<Equipment[]>(routes.api.equipment.list()),
  meta: { errorMessage: "load.equipment" },
});

export const exercisesQuery = queryOptions({
  queryKey: ["exercises"],
  queryFn: () => api.get<Exercise[]>(routes.api.exercises.list()),
  meta: { errorMessage: "load.exercises" },
});

export const routinesQuery = queryOptions({
  queryKey: ["routines"],
  queryFn: () => api.get<Routine[]>(routes.api.routines.list()),
  meta: { errorMessage: "load.routines" },
});

export const routineQuery = (id: string) =>
  queryOptions({
    queryKey: ["routines", id],
    queryFn: () => api.get<Routine>(routes.api.routines.get(id)),
    enabled: id !== "",
    meta: { errorMessage: "load.routine" },
  });

export const programsQuery = queryOptions({
  queryKey: ["programs"],
  queryFn: () => api.get<Program[]>(routes.api.programs.list()),
  meta: { errorMessage: "load.programs" },
});

export const programQuery = (id: string) =>
  queryOptions({
    queryKey: ["programs", id],
    queryFn: () => api.get<Program>(routes.api.programs.get(id)),
    enabled: id !== "",
    meta: { errorMessage: "load.program" },
  });

export const activeProgramQuery = queryOptions({
  queryKey: ["programs", "active"],
  queryFn: () => api.get<ActiveProgram>(routes.api.programs.active()),
  meta: { errorMessage: "load.activeProgram" },
});

export const measurementsQuery = queryOptions({
  queryKey: ["measurements"],
  queryFn: () => api.get<BodyMeasurement[]>(routes.api.measurements.list()),
  meta: { errorMessage: "load.measurements" },
});

export const exploreKey = ["explore"] as const;

export const exploreQuery = (kind: PublicationKind, sort: ExploreSort) =>
  queryOptions({
    queryKey: [...exploreKey, kind, sort],
    queryFn: () =>
      api.get<ExploreListItem[]>(routes.api.explore.list(kind, sort)),
    meta: { errorMessage: "load.publications" },
  });

export const myPublicationsQuery = queryOptions({
  queryKey: [...exploreKey, "mine"],
  queryFn: () => api.get<ExploreListItem[]>(routes.api.publications.mine()),
  meta: { errorMessage: "load.myPublications" },
});

export const sessionsQuery = infiniteQueryOptions({
  queryKey: ["sessions"],
  queryFn: ({ pageParam }) =>
    api.get<SessionPage>(routes.api.sessions.list(pageParam)),
  initialPageParam: null as string | null,
  getNextPageParam: (page) => page.next,
  meta: { errorMessage: "load.history" },
});

export const sessionQuery = (id: string) =>
  queryOptions({
    queryKey: ["sessions", id],
    queryFn: () => api.get<{ sets: Workout[] }>(routes.api.sessions.one(id)),
    enabled: id !== "",
    meta: { errorMessage: "load.session" },
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
