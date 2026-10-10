// ponytail: fallback si el cliente no manda su tz al pedir el progreso.
// Hoy todos entrenan en Perú; el frontend es el dueño real de la timezone.
const FALLBACK_TIMEZONE = 'America/Lima';

const formatters = new Map<string, Intl.DateTimeFormat>();

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
