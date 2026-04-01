import { SetMetadata } from '@nestjs/common';

/**
 * Mark a route or controller as publicly accessible (no auth required).
 * AuthGuard checks for this metadata and skips token validation when present.
 *
 * Usage:
 *   @Public()
 *   @Get('health')
 *   health() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
