import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';
import { extractBearerToken } from '../../modules/auth/auth-header';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: unknown }>();
    const token = extractBearerToken(request.headers['authorization']);
    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization: Bearer <token> header.');
    }

    const result = this.authService.validateToken(token);
    if (!result.ok) {
      throw new UnauthorizedException(result.message);
    }

    request.user = result.user;
    return true;
  }
}
