export const routes = {
  home: () => "/",
  success: () => "/success",
  routines: () => "/routines",
  routineNew: () => "/routines/new",
  routineEdit: (id: string) => `/routines/${id}`,
  train: () => "/train",
  log: () => "/log",

  api: {
    workouts: {
      dates: () => "/workouts/dates",
      create: () => "/workouts",
      list: (date?: string) => (date ? `/workouts?date=${date}` : "/workouts"),
      last: (exerciseId: string) => `/workouts/last?exerciseId=${exerciseId}`,
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
