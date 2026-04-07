export const routes = {
  home: () => "/",
  success: () => "/success",

  api: {
    workouts: {
      create: () => "/workouts",
      list: () => "/workouts",
      update: (id: string) => `/workouts/${id}`,
      delete: (id: string) => `/workouts/${id}`,
    },
  },
} as const;
