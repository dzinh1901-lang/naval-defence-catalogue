import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RequestUser } from '../../common/types/request-user.type';
import type { JwtPayload } from './jwt.strategy';

type AuthFailureReason = 'missing' | 'invalid' | 'expired';

type AuthValidationResult =
  | { ok: true; user: RequestUser }
  | { ok: false; reason: AuthFailureReason; message: string };

/**
 * Auth service — Milestone 4.
 *
 * JWT verification via passport-jwt is the primary auth mechanism.
 * JWT signing and verification require an explicit JWT_SECRET at runtime.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Sign a JWT for the given user principal.
   * Respects JWT_EXPIRES_IN_SECS environment variable (default: 28800 = 8 hours).
   */
  signToken(user: RequestUser): string {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    const envExpiry = parseInt(process.env['JWT_EXPIRES_IN_SECS'] ?? '', 10);
    const overrides = !isNaN(envExpiry) ? { expiresIn: envExpiry } : {};

    return this.jwtService.sign(payload, overrides);
  }

  /**
   * Validate a bearer token and return a RequestUser principal.
   *
   * Returns an explicit failure reason for missing, invalid, or expired tokens.
   */
  validateToken(token: string | undefined): AuthValidationResult {
    if (!token) {
      return { ok: false, reason: 'missing', message: 'Missing bearer token.' };
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.sub && payload.email && payload.organizationId) {
        return {
          ok: true,
          user: {
            userId: payload.sub,
            email: payload.email,
            organizationId: payload.organizationId,
            role: payload.role ?? 'VIEWER',
          },
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        return { ok: false, reason: 'expired', message: 'Bearer token has expired.' };
      }
      return { ok: false, reason: 'invalid', message: 'Bearer token is invalid.' };
    }

    return { ok: false, reason: 'invalid', message: 'Bearer token payload is incomplete.' };
  }

  /** @deprecated Use validateToken instead */
  validateUser(token: string | undefined): RequestUser | null {
    const result = this.validateToken(token);
    return result.ok ? result.user : null;
  }
}
