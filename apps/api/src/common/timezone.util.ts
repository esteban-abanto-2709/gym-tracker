// ponytail: fallback si el cliente no manda su tz al pedir recomendación.
// Hoy todos entrenan en Perú; el frontend es el dueño real de la timezone.
const FALLBACK_TIMEZONE = 'America/Lima';

export function toLocalDateString(
  date: Date,
  timeZone: string = FALLBACK_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
