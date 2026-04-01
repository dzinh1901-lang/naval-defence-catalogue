import { SetMetadata } from '@nestjs/common';

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';

/**
 * Metadata key for required roles.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator to specify the minimum roles required to access a route.
 * The guard resolves project-level roles first, falling back to org-level.
 *
 * Usage:
 *   @Roles('ADMIN', 'MEMBER')
 *   @Post()
 *   create(...) { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
