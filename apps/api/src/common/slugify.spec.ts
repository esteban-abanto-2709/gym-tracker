import { slugify } from './slugify';

describe('slugify', () => {
  it('matches the normalization of the migration', () => {
    expect(slugify('  Press Inclinado ')).toBe('press-inclinado');
    expect(slugify('Máquina & Polea')).toBe('maquina-polea');
    expect(slugify('press militar (máquina)')).toBe('press-militar-maquina');
  });
});
