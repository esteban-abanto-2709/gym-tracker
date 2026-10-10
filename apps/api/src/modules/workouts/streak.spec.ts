import { computeStreak, groupSessions, type StreakSet } from './streak';

const TZ = 'UTC';
const target = { sets: 3, reps: 8, repsMax: 10 };

const session = (
  date: string,
  reps: number[],
  opts: { weight?: number; free?: boolean; equipment?: string } = {},
): StreakSet[] =>
  reps.map((r, i) => ({
    weight: opts.weight ?? 60,
    reps: r,
    routineId: opts.free ? null : 'lower-a',
    equipmentId: opts.equipment ?? 'barra',
    equipment: { name: opts.equipment === 'maquina' ? 'Máquina' : 'Barra' },
    createdAt: new Date(`${date}T10:0${i}:00Z`),
  }));

const streakOf = (sets: StreakSet[], today = '2026-10-20') =>
  computeStreak(groupSessions(sets, TZ), target, today);

describe('computeStreak', () => {
  it('dos sesiones con todas las series al tope suman 2 y sugieren subir', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10]),
      ]),
    ).toEqual({ streak: 2, suggestion: 'up' });
  });

  it('una serie bajo el tope rompe la racha', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 9, 10]),
      ]),
    ).toEqual({ streak: 0, suggestion: null });
  });

  it('una sesion vieja rota no borra la racha posterior', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 9, 10]),
        ...session('2026-10-04', [10, 10, 10]),
        ...session('2026-10-07', [10, 10, 10]),
      ]).streak,
    ).toBe(2);
  });

  it('subir el peso reinicia la racha', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10], { weight: 62.5 }),
      ]).streak,
    ).toBe(1);
  });

  it('cambiar de equipo reinicia la racha', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10, 10], { equipment: 'maquina' }),
      ]).streak,
    ).toBe(1);
  });

  it('el dia libre no suma ni rompe', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-02', [5, 5], { free: true }),
        ...session('2026-10-04', [10, 10, 10]),
      ]),
    ).toEqual({ streak: 2, suggestion: 'up' });
  });

  it('menos series de las que pide la rutina no suma', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [10, 10]),
      ]).streak,
    ).toBe(0);
  });

  it('la sesion de hoy a medias y al tope no rompe la racha', () => {
    expect(
      streakOf(
        [
          ...session('2026-10-01', [10, 10, 10]),
          ...session('2026-10-04', [10, 10, 10]),
          ...session('2026-10-20', [10]),
        ],
        '2026-10-20',
      ).streak,
    ).toBe(2);
  });

  it('hoy con una serie bajo el tope ya rompe la racha', () => {
    expect(
      streakOf(
        [...session('2026-10-04', [10, 10, 10]), ...session('2026-10-20', [9])],
        '2026-10-20',
      ).streak,
    ).toBe(0);
  });

  it('bajo el piso sugiere bajar', () => {
    expect(
      streakOf([
        ...session('2026-10-01', [10, 10, 10]),
        ...session('2026-10-04', [8, 7, 5]),
      ]),
    ).toEqual({ streak: 0, suggestion: 'down' });
  });

  it('sin rango el tope es la meta de reps', () => {
    const sessions = groupSessions(session('2026-10-04', [8, 8, 8]), TZ);
    expect(
      computeStreak(sessions, { sets: 3, reps: 8, repsMax: null }, '2026-10-20')
        .streak,
    ).toBe(1);
  });

  it('sin sesiones con rutina no hay racha ni sugerencia', () => {
    expect(
      streakOf(session('2026-10-04', [10, 10, 10], { free: true })),
    ).toEqual({ streak: 0, suggestion: null });
  });
});

describe('groupSessions', () => {
  it('separa por dia, rutina y equipo, de la mas reciente a la mas vieja', () => {
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
});
