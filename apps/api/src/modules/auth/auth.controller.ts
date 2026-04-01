import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * GET /api/v1/auth/me
   * Returns the current authenticated user principal.
   */
  @Get('me')
  me(@CurrentUser() user: RequestUser | undefined) {
    if (!user) throw new UnauthorizedException('No authenticated user');
    return user;
  }

  /**
   * GET /api/v1/auth/whoami
   * Public endpoint for connectivity checks — always returns a guest identity.
   */
  @Public()
  @Get('whoami')
  whoami() {
    return { identity: 'guest', note: 'Authenticate with Authorization: Bearer <token>' };
  }
}
