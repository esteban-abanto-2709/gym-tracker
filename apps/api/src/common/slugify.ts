const ACCENTS: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
  Á: 'A',
  É: 'E',
  Í: 'I',
  Ó: 'O',
  Ú: 'U',
  Ü: 'U',
  Ñ: 'N',
};

// Debe coincidir con el slugify SQL de la migración 20260723201500_equipo_tabla_y_slug.
export function slugify(name: string): string {
  return name
    .trim()
    .replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, (c) => ACCENTS[c])
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}
