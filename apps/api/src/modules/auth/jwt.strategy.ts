import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RequestUser } from '../../common/types/request-user.type';
import { getJwtSecret } from './auth-env';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  iat?: number;
  exp?: number;
}

/**
 * JWT Passport strategy — Milestone 4.
 *
 * Validates Bearer tokens signed with JWT_SECRET.
 * The validated payload is attached to the request as `user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: JwtPayload): RequestUser {
    if (!payload.sub || !payload.email || !payload.organizationId) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role ?? 'VIEWER',
    };
  }
}
