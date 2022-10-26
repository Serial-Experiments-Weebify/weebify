import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/UserRole.enum';

/*
    The ROLES_KEY is just a constant that we use to access the metadata
    that we set on the handler. We check for this key in the RolesGuard
*/

export const ROLES_KEY = 'allowed_roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
