export const SESSION_GAP_MS = 3 * 60 * 60 * 1000;
const MAX_PAST_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FUTURE_MS = 5 * 60 * 1000;

export function setTime(performedAt: string | undefined, now: Date): Date {
  if (!performedAt) return now;
  const time = new Date(performedAt);
  const offset = time.getTime() - now.getTime();
  if (Number.isNaN(offset) || offset > MAX_FUTURE_MS || -offset > MAX_PAST_MS)
    return now;
  return time;
}

export function continuesSession(lastSetAt: Date, setAt: Date): boolean {
  return setAt.getTime() - lastSetAt.getTime() <= SESSION_GAP_MS;
}
