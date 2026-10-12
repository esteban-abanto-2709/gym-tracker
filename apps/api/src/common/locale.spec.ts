import {
  localizeExerciseNames,
  pickName,
  resolveLocale,
  toSearchName,
} from './locale';

describe('resolveLocale', () => {
  it('uses the saved preference first', () => {
    expect(resolveLocale('en', 'es-PE,es;q=0.9')).toBe('en');
  });

  it('falls back to the device language when it is Spanish or English', () => {
    expect(resolveLocale(null, 'es-PE,es;q=0.9,en;q=0.8')).toBe('es');
    expect(resolveLocale(null, 'en-US,en;q=0.9')).toBe('en');
  });

  it('uses English for any other device language or none', () => {
    expect(resolveLocale(null, 'fr-FR,fr;q=0.9,es;q=0.8')).toBe('en');
    expect(resolveLocale(undefined, undefined)).toBe('en');
  });
});

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
