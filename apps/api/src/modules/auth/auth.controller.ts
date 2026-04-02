import {
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

class IssueTokenDto {
  @IsString()
  @MinLength(1)
  userId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  organizationId!: string;

  @IsIn(['ADMIN', 'MEMBER', 'VIEWER'])
  role!: 'ADMIN' | 'MEMBER' | 'VIEWER';

  /**
   * Dev-only bootstrap secret — prevents unrestricted token issuance.
   * In production, replace this endpoint with a proper identity provider flow.
   */
  @IsString()
  @MinLength(8)
  bootstrapSecret!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * POST /api/v1/auth/token
   * Issue a signed JWT for the given principal.
   * Protected by a bootstrap secret; intended for development and service accounts.
   * In production, wire this to a real identity provider.
   */
  @Public()
  @Post('token')
  issueToken(@Body() dto: IssueTokenDto) {
    const expected = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
    if (!expected) {
      throw new ServiceUnavailableException(
        'AUTH_BOOTSTRAP_SECRET is not configured on this API instance.',
      );
    }

    if (dto.bootstrapSecret !== expected) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }

    const user: RequestUser = {
      userId: dto.userId,
      email: dto.email,
      organizationId: dto.organizationId,
      role: dto.role,
    };

    return { accessToken: this.auth.signToken(user) };
  }

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
