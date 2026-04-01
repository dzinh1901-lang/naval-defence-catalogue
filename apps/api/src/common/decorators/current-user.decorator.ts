import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../types/request-user.type';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: RequestUser) { ... }
 *
 * Populated by AuthGuard after token validation.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    return request.user;
  },
);
