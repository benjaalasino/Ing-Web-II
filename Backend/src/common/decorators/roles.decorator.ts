import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Marca los roles permitidos para un handler/controlador. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
