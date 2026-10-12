import type { Locale } from '@prisma/client';

export function resolveLocale(
  preferred: Locale | null | undefined,
  acceptLanguage: string | undefined,
): Locale {
  if (preferred) return preferred;
  const device = acceptLanguage?.trim().toLowerCase() ?? '';
  return device.startsWith('es') ? 'es' : 'en';
}

export function toSearchName(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
