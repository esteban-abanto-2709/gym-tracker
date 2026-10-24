import type {
  ExploreSort,
  ExploreTab,
  PublicationKind,
  SetType,
} from "@/lib/types";

const kindPath: Record<PublicationKind, Exclude<ExploreTab, "mine">> = {
  ROUTINE: "routines",
  PROGRAM: "programs",
};

const dayStart = (day: string, offset = 0) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d + offset).toISOString();
};

export const routes = {
  home: () => "/",
  success: () => "/success",
  history: () => "/history",
  profile: () => "/perfil",
  settings: () => "/perfil/ajustes",
  routines: () => "/routines",
  routineNew: () => "/routines/new",
  routineEdit: (id: string) => `/routines/${id}`,
  routinePublish: (id: string) => `/routines/${id}/publish`,
  programs: () => "/programs",
  programNew: () => "/programs/new",
  programEdit: (id: string) => `/programs/${id}`,
  programPublish: (id: string) => `/programs/${id}/publish`,
  explore: (tab?: ExploreTab) => (tab ? `/explore?tab=${tab}` : "/explore"),
  explorePublication: (kind: PublicationKind, slug: string) =>
    `/explore/${kindPath[kind]}/${slug}`,
  train: () => "/train",
  log: () => "/log",
  login: () => "/login",
  register: () => "/register",
  privacy: () => "/privacidad",

  api: {
    auth: {
      me: () => "/auth/me",
      login: () => "/auth/login",
      register: () => "/auth/register",
      google: () => "/auth/google",
      logout: () => "/auth/logout",
      password: () => "/auth/password",
    },
    workouts: {
      create: () => "/workouts",
      range: (fromDay: string, toDay: string) =>
        `/workouts?from=${encodeURIComponent(dayStart(fromDay))}&to=${encodeURIComponent(dayStart(toDay, 1))}`,
      recommendation: (
        exerciseId: string,
        equipmentId: string | null,
        setType: SetType = "WORKING",
        step: number | null = null,
      ) =>
        `/workouts/recommendation?exerciseId=${exerciseId}&equipmentId=${encodeURIComponent(equipmentId ?? "")}&setType=${setType}${step != null ? `&step=${step}` : ""}`,
      progress: (exerciseId: string, routineId: string, tz: string) =>
        `/workouts/progress?exerciseId=${exerciseId}&routineId=${routineId}&tz=${encodeURIComponent(tz)}`,
      update: (id: string) => `/workouts/${id}`,
      delete: (id: string) => `/workouts/${id}`,
    },
    sessions: {
      list: (before: string | null = null) =>
        before ? `/sessions?before=${encodeURIComponent(before)}` : "/sessions",
      one: (id: string) => `/sessions/${id}`,
    },
    exercises: {
      create: () => "/exercises",
      list: () => "/exercises",
    },
    equipment: {
      list: () => "/equipment",
    },
    measurements: {
      list: () => "/measurements",
      upsert: () => "/measurements",
      delete: (date: string) => `/measurements/${date}`,
    },
    routines: {
      list: () => "/routines",
      create: () => "/routines",
      get: (id: string) => `/routines/${id}`,
      update: (id: string) => `/routines/${id}`,
      delete: (id: string) => `/routines/${id}`,
    },
    programs: {
      list: () => "/programs",
      create: () => "/programs",
      get: (id: string) => `/programs/${id}`,
      update: (id: string) => `/programs/${id}`,
      delete: (id: string) => `/programs/${id}`,
      active: () => "/programs/active",
    },
    publications: {
      publishRoutine: (id: string) => `/routines/${id}/publish`,
      publishProgram: (id: string) => `/programs/${id}/publish`,
      mine: () => "/publications/mine",
      update: (id: string) => `/publications/${id}`,
      delete: (id: string) => `/publications/${id}`,
      slugAvailable: (kind: PublicationKind, slug: string) =>
        `/publications/slug-available?kind=${kind}&slug=${encodeURIComponent(slug)}`,
    },
    explore: {
      list: (kind: PublicationKind, sort: ExploreSort) =>
        `/explore/${kindPath[kind]}?sort=${sort}`,
      get: (kind: PublicationKind, slug: string) =>
        `/explore/${kindPath[kind]}/${slug}`,
      copy: (kind: PublicationKind, slug: string) =>
        `/explore/${kindPath[kind]}/${slug}/copy`,
      like: (kind: PublicationKind, slug: string) =>
        `/explore/${kindPath[kind]}/${slug}/like`,
    },
  },
} as const;
