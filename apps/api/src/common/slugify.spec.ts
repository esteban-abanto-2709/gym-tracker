import { slugify } from './slugify';

describe('slugify', () => {
  it('coincide con la normalización de la migración', () => {
    expect(slugify('  Press Inclinado ')).toBe('press-inclinado');
    expect(slugify('Máquina & Polea')).toBe('maquina-polea');
    expect(slugify('press militar (máquina)')).toBe('press-militar-maquina');
  });
});
