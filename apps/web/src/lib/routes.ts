export const routes = {
  home: () => "/",
  success: () => "/success",

  api: {
    workouts: {
      create: () => "/workouts",
      list: () => "/workouts",
    },
  },
} as const;
