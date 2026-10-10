import type { SetType } from "@/lib/types";

const dayStart = (day: string, offset = 0) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d + offset).toISOString();
};

export const routes = {
  home: () => "/",
  success: () => "/success",
  history: () => "/history",
  profile: () => "/perfil",
  routines: () => "/routines",
  routineNew: () => "/routines/new",
  routineEdit: (id: string) => `/routines/${id}`,
  programs: () => "/programs",
  programNew: () => "/programs/new",
  programEdit: (id: string) => `/programs/${id}`,
  explore: () => "/explore",
  exploreProgram: (id: string) => `/explore/${id}`,
  train: () => "/train",
  log: () => "/log",
  login: () => "/login",
  register: () => "/register",

  api: {
    auth: {
      me: () => "/auth/me",
      login: () => "/auth/login",
      register: () => "/auth/register",
      google: () => "/auth/google",
      logout: () => "/auth/logout",
    },
    workouts: {
      create: () => "/workouts",
      days: (tz: string) => `/workouts/days?tz=${encodeURIComponent(tz)}`,
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
      explore: () => "/programs/explore",
      copy: (id: string) => `/programs/${id}/copy`,
    },
  },
} as const;
