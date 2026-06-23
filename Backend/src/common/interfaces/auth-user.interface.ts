/** Datos del usuario autenticado que el guard adjunta a la request. */
export interface AuthUser {
  userId: number;
  role: string;
  name: string;
}
