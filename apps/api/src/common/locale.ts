import type { Locale } from '@prisma/client';

export function toSearchName(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

interface StoredName {
  locale: Locale;
  name: string;
}

export function pickName(names: StoredName[], locale: Locale): string {
  return (
    names.find((n) => n.locale === locale)?.name ??
    names.find((n) => n.locale === 'en')?.name ??
    names[0]?.name ??
    ''
  );
}

export function localizeExerciseNames(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => localizeExerciseNames(item, locale));
  }
  if (!value || typeof value !== 'object' || value instanceof Date) {
    return value;
  }
  const entries = Object.entries(value as Record<string, unknown>).map(
    ([key, child]) => [key, localizeExerciseNames(child, locale)],
  );
  const object = Object.fromEntries(entries) as Record<string, unknown>;
  if ('slug' in object && Array.isArray(object.names)) {
    const { names, ...rest } = object;
    return { ...rest, name: pickName(names as StoredName[], locale) };
  }
  return object;
}
