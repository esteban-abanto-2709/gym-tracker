import { localizeExerciseNames, pickName, toSearchName } from './locale';

describe('toSearchName', () => {
  it('ignores case, accents and surrounding spaces', () => {
    expect(toSearchName('  Extensión de Tríceps ')).toBe(
      'extension de triceps',
    );
    expect(toSearchName('Señor Ç')).toBe('senor c');
  });
});

describe('localizeExerciseNames', () => {
  const names = [
    { locale: 'en' as const, name: 'Bench Press' },
    { locale: 'es' as const, name: 'Press de banca' },
  ];

  it('replaces nested exercise names with the one in the user language', () => {
    const createdAt = new Date('2026-10-12');
    const body = [
      {
        id: 'routine',
        name: 'Upper A',
        createdAt,
        items: [{ exercise: { id: 'e1', slug: 'bench-press', names } }],
      },
    ];

    expect(localizeExerciseNames(body, 'es')).toEqual([
      {
        id: 'routine',
        name: 'Upper A',
        createdAt,
        items: [
          {
            exercise: { id: 'e1', slug: 'bench-press', name: 'Press de banca' },
          },
        ],
      },
    ]);
  });

  it('falls back to English, then to any name', () => {
    expect(pickName([names[0]], 'es')).toBe('Bench Press');
    expect(pickName([{ locale: 'es', name: 'Remo raro' }], 'en')).toBe(
      'Remo raro',
    );
  });
});
