export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? 'America/Lima';

export function toLocalDateString(
  date: Date,
  timeZone: string = APP_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function localDayRangeUtc(
  dateStr: string,
  timeZone: string = APP_TIMEZONE,
): { start: Date; end: Date } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return {
    start: zonedTimeToUtc(timeZone, year, month, day, 0, 0, 0, 0),
    end: zonedTimeToUtc(timeZone, year, month, day, 23, 59, 59, 999),
  };
}

function zonedTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
): Date {
  const utcGuess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    millisecond,
  );
  const offset = getTimeZoneOffsetMs(timeZone, new Date(utcGuess));
  return new Date(utcGuess - offset);
}

function getTimeZoneOffsetMs(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = Number(part.value);
    }
  }

  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    map.hour === 24 ? 0 : map.hour,
    map.minute,
    map.second,
  );

  return asUtc - date.getTime();
}
