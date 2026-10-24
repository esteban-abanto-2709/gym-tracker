import { computeStreak, groupSessions, type StreakSet } from './streak';

const TZ = 'UTC';
const target = { sets: 3, reps: 8, repsMax: 10 };

const session = (
  date: string,
  reps: number[],
  opts: {
    weight?: number;
    free?: boolean;
    equipment?: string;
    sessionId?: string;
  } = {},
): StreakSet[] =>
  reps.map((r, i) => ({
    weight: opts.weight ?? 60,
    reps: r,
    routineId: opts.free ? null : 'lower-a',
    sessionId: opts.sessionId ?? `session-${date}`,
    equipmentId: opts.equipment ?? 'barra',
    equipment: { name: opts.equipment === 'maquina' ? 'Máquina' : 'Barra' },
    createdAt: new Date(`${date}T10:0${i}:00Z`),
  }));

const at = (iso: string) => new Date(iso);

const streakOf = (sets: StreakSet[], now = at('2026-10-20T12:00:00Z')) =>
  computeStreak(groupSessions(sets, TZ), target, now);

describe('computeStreak', () => {
  it('two sessions with every set at the top count 2 and suggest going up', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10]),
      ]),
    ).toEqual({ streak: 2, suggestion: 'up' });
  });

  it('a set below the top breaks the streak', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 9, 10]),
      ]),
    ).toEqual({ streak: 0, suggestion: null });
  });

  it('an old broken session does not erase the later streak', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 9, 10]),
        ...session('2026-10-04', [10, 10, 10]),
        ...session('2026-10-07', [10, 10, 10]),
      ]).streak,
    ).toBe(2);
  });

  it('raising the weight restarts the streak', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10], { weight: 62.5 }),
      ]).streak,
    ).toBe(1);
  });

  it('changing equipment restarts the streak', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10], { equipment: 'maquina' }),
      ]).streak,
    ).toBe(1);
  });

  it('a free day neither adds nor breaks', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-02', [5, 5], { free: true }),
        ...session('2026-10-04', [10, 10, 10]),
      ]),
    ).toEqual({ streak: 2, suggestion: 'up' });
  });

  it('fewer sets than the routine asks for does not add', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10]),
      ]).streak,
    ).toBe(0);
  });

  it('an unfinished session today at the top does not break the streak', () => {
    expect(
      streakOf(
        [
          ...session('2026-10-01', [10, 10, 10]),
          ...session('2026-10-04', [10, 10, 10]),
          ...session('2026-10-20', [10]),
        ],
        at('2026-10-20T12:00:00Z'),
      ).streak,
    ).toBe(2);
  });

  it('a set below the top today already breaks the streak', () => {
    expect(
      streakOf(
        [...session('2026-10-04', [10, 10, 10]), ...session('2026-10-20', [9])],
        at('2026-10-20T12:00:00Z'),
      ).streak,
    ).toBe(0);
  });

  it('below the floor suggests going down', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [8, 7, 5]),
      ]),
    ).toEqual({ streak: 0, suggestion: 'down' });
  });

  it('without a range the top is the reps target', () => {
    const sessions = groupSessions(session('2026-10-04', [8, 8, 8]), TZ);
    expect(
      computeStreak(
        sessions,
        { sets: 3, reps: 8, repsMax: null },
        at('2026-10-20T12:00:00Z'),
      ).streak,
    ).toBe(1);
  });

  it('an unfinished session that started before midnight is still open', () => {
    const late: StreakSet = {
      ...session('2026-10-19', [10])[0],
      sessionId: 'late',
      createdAt: at('2026-10-19T23:30:00Z'),
    };
    expect(
      streakOf(
        [...session('2026-10-04', [10, 10, 10]), late],
        at('2026-10-20T00:30:00Z'),
      ).streak,
    ).toBe(1);
  });

  it('an unfinished session hours ago is closed and breaks the streak', () => {
    expect(
      streakOf(
        [
          ...session('2026-10-04', [10, 10, 10]),
          ...session('2026-10-20', [10]),
        ],
        at('2026-10-20T16:00:00Z'),
      ).streak,
    ).toBe(0);
  });

  it('without routine sessions there is no streak or suggestion', () => {
    expect(
      streakOf(session('2026-10-04', [10, 10, 10], { free: true })),
    ).toEqual({ streak: 0, suggestion: null });
  });
});

describe('groupSessions', () => {
  it('splits by day, routine and equipment, newest first', () => {
    const sessions = groupSessions(
      [
        ...session('2026-10-01', [10, 9]),
        ...session('2026-10-04', [8], { free: true }),
        ...session('2026-10-04', [10, 10], { equipment: 'maquina' }),
      ],
      TZ,
    );
    expect(
      sessions.map((s) => [s.date, s.free, s.equipment, s.sets.length]),
    ).toEqual([
      ['2026-10-04', false, 'Máquina', 2],
      ['2026-10-04', true, 'Barra', 1],
      ['2026-10-01', false, 'Barra', 2],
    ]);
    expect(sessions[2].sets.map((s) => s.reps)).toEqual([10, 9]);
  });

  it('a session that crosses midnight stays whole, dated by its start', () => {
    const sets: StreakSet[] = [
      '2026-10-19T23:40:00Z',
      '2026-10-19T23:50:00Z',
      '2026-10-20T00:10:00Z',
    ].map((iso) => ({
      ...session('2026-10-19', [10])[0],
      sessionId: 'night',
      createdAt: at(iso),
    }));
    const sessions = groupSessions(sets, TZ);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].date).toBe('2026-10-19');
    expect(sessions[0].sets).toHaveLength(3);
  });

  it('two sessions on the same day stay apart', () => {
    const sessions = groupSessions(
      [
        ...session('2026-10-04', [10, 10], { sessionId: 'morning' }),
        ...session('2026-10-04', [10], { sessionId: 'evening' }),
      ],
      TZ,
    );
    expect(sessions).toHaveLength(2);
  });
});
