export const routes = {
  home: () => "/",
  success: () => "/success",

  api: {
    workouts: {
      create: () => "/workouts",
    },
  },
} as const;
