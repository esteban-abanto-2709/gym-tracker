export const routes = {
  home: () => "/",
  success: () => "/success",

  api: {
    workouts: {
      dates: () => "/workouts/dates",
      create: () => "/workouts",
      list: (date?: string) => date ? `/workouts?date=${date}` : "/workouts",
      update: (id: string) => `/workouts/${id}`,
      delete: (id: string) => `/workouts/${id}`,
    },
  },
} as const;
