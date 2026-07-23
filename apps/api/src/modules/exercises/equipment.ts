export const EQUIPMENT = [
  'Sin asignar',
  'Barra',
  'Polea',
  'Mancuerna',
  'Máquina',
  'Peso Corporal',
  'Otro',
] as const;

export type Equipment = (typeof EQUIPMENT)[number];
