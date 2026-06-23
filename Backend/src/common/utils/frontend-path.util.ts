import * as fs from 'fs';
import * as path from 'path';

/**
 * Busca la carpeta del frontend (Frontend/public/src) probando rutas
 * relativas tanto al directorio de ejecucion como al codigo compilado.
 * Devuelve la primera que exista o null si el frontend no esta presente.
 */
export const resolveFrontendRoot = (): string | null => {
  const candidates = [
    path.resolve(process.cwd(), 'Frontend/public/src'),
    path.resolve(process.cwd(), '../Frontend/public/src'),
    path.resolve(__dirname, '../../../../Frontend/public/src'),
    path.resolve(__dirname, '../../../Frontend/public/src'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
};
