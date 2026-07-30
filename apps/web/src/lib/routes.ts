export const routes = {
  home: () => "/",
  success: () => "/success",
  history: () => "/history",
  profile: () => "/perfil",
  routines: () => "/routines",
  routineNew: () => "/routines/new",
  routineEdit: (id: string) => `/routines/${id}`,
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
      list: () => "/workouts",
      recommendation: (
        exerciseId: string,
        isApproximation: boolean,
        tz: string,
        equipmentId: string | null,
      ) =>
        `/workouts/recommendation?exerciseId=${exerciseId}&isApproximation=${isApproximation}&tz=${encodeURIComponent(tz)}&equipmentId=${encodeURIComponent(equipmentId ?? "")}`,
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
    routines: {
      list: () => "/routines",
      create: () => "/routines",
      get: (id: string) => `/routines/${id}`,
      update: (id: string) => `/routines/${id}`,
      delete: (id: string) => `/routines/${id}`,
    },
  },
} as const;
