import { resolveLocale, toSearchName } from './locale';

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
