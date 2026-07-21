export const routes = {
  home: () => "/",
  success: () => "/success",
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
      logout: () => "/auth/logout",
    },
    workouts: {
      dates: () => "/workouts/dates",
      create: () => "/workouts",
      list: (date?: string) => (date ? `/workouts?date=${date}` : "/workouts"),
      recommendation: (exerciseId: string, isApproximation: boolean) =>
        `/workouts/recommendation?exerciseId=${exerciseId}&isApproximation=${isApproximation}`,
      update: (id: string) => `/workouts/${id}`,
      delete: (id: string) => `/workouts/${id}`,
    },
    exercises: {
      create: () => "/exercises",
      list: () => "/exercises",
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
