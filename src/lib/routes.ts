/**
 * Rutas de la aplicación centralizadas
 * Evita hardcodear URLs en toda la app
 */

export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',

  // User routes
  userHome: (userSlug: string) => `/${userSlug}`,

  // Tracker routes
  tracker: (userSlug: string) => `/${userSlug}/tracker`,
  workout: (userSlug: string, workoutSlug: string) => `/${userSlug}/tracker/${workoutSlug}`,
  workoutConfirm: (userSlug: string, workoutSlug: string) => `/${userSlug}/tracker/${workoutSlug}/confirm`,

  // Dashboard routes (para el futuro)
  dashboard: (userSlug: string) => `/${userSlug}/dashboard`,
  dashboardWorkouts: (userSlug: string) => `/${userSlug}/dashboard/workouts`,
  dashboardExercises: (userSlug: string) => `/${userSlug}/dashboard/exercises`,
  dashboardStats: (userSlug: string) => `/${userSlug}/dashboard/stats`,
} as const;

/**
 * Helper para construir URLs con query params
 */
export function buildUrl(path: string, params?: Record<string, string | number | boolean>) {
  if (!params) return path;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${path}?${searchParams.toString()}`;
}