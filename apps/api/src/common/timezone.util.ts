// ponytail: fallback when the client sends no tz; the frontend owns the real timezone.
export const FALLBACK_TIMEZONE = 'America/Lima';

const formatters = new Map<string, Intl.DateTimeFormat>();

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function toLocalDateString(
  date: Date,
  timeZone: string = FALLBACK_TIMEZONE,
): string {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter.format(date);
}
