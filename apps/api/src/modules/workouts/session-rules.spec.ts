import { continuesSession, SESSION_GAP_MS, setTime } from './session-rules';

const now = new Date('2026-10-24T12:00:00.000Z');
const minutes = (n: number) => n * 60 * 1000;

describe('setTime', () => {
  it('uses the time the set was done', () => {
    const at = new Date(now.getTime() - minutes(30));
    expect(setTime(at.toISOString(), now)).toEqual(at);
  });

  it('without a time it uses the server time', () => {
    expect(setTime(undefined, now)).toBe(now);
  });

  it('a time in the future beyond the clock drift falls back to now', () => {
    const at = new Date(now.getTime() + minutes(10));
    expect(setTime(at.toISOString(), now)).toBe(now);
  });

  it('a small clock drift into the future is kept', () => {
    const at = new Date(now.getTime() + minutes(2));
    expect(setTime(at.toISOString(), now)).toEqual(at);
  });

  it('a time older than a week falls back to now', () => {
    const at = new Date(now.getTime() - 8 * 24 * minutes(60));
    expect(setTime(at.toISOString(), now)).toBe(now);
  });
});

describe('continuesSession', () => {
  const last = new Date('2026-10-24T04:00:00.000Z');

  it('a set within the gap continues the session, even past midnight', () => {
    expect(continuesSession(last, new Date(last.getTime() + minutes(90)))).toBe(
      true,
    );
  });

  it('a set right at the gap still continues it', () => {
    expect(
      continuesSession(last, new Date(last.getTime() + SESSION_GAP_MS)),
    ).toBe(true);
  });

  it('a set after the gap starts a new session', () => {
    expect(
      continuesSession(last, new Date(last.getTime() + SESSION_GAP_MS + 1)),
    ).toBe(false);
  });
});
