export const CATEGORIES = [
  'Comida',
  'Transporte',
  'Salud',
  'Entretenimiento',
  'Supermercado',
  'Educacion',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];
