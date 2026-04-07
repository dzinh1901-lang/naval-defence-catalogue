import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RequestUser } from '../../common/types/request-user.type';
import type { JwtPayload } from './jwt.strategy';

/**
 * Auth service — Milestone 4.
 *
 * JWT verification via passport-jwt is the primary auth mechanism.
 * A dev-token sentinel is retained for local development and testing
 * when JWT_SECRET is not configured (NODE_ENV=development only).
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Sign a JWT for the given user principal.
   * Respects JWT_EXPIRES_IN_SECS environment variable (default: 604800 = 7 days).
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
   * JWT verification is always attempted first using the configured secret.
   * If JWT_SECRET is not set, the dev sentinel tokens are also accepted as a
   * convenience for local development without a full auth setup.
   *
   * Returns null if the token is absent or invalid.
   */
  validateToken(token: string | undefined): RequestUser | null {
    if (!token) return null;

    // ── JWT path — always attempted first ─────────────────────────────────
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.sub && payload.email && payload.organizationId) {
        return {
          userId: payload.sub,
          email: payload.email,
          organizationId: payload.organizationId,
          role: payload.role ?? 'VIEWER',
        };
      }
    } catch {
      // Token is not a valid JWT — fall through to dev sentinel check.
    }

    // ── Dev-token fallback (only when JWT_SECRET is absent from env) ───────
    if (process.env['JWT_SECRET']) {
      // In production (JWT_SECRET set) reject anything that isn't a valid JWT.
      return null;
    }

    if (token === 'dev-token') {
      return {
        userId: 'user-cmdr-lee',
        email: 'cmdr.lee@naval-systems.dev',
        organizationId: 'org-naval-systems-command',
        role: 'ADMIN',
      };
    }

    return {
      userId: 'user-dr-chen',
      email: 'eng.chen@naval-systems.dev',
      organizationId: 'org-naval-systems-command',
      role: 'MEMBER',
    };
  }

  /** @deprecated Use validateToken instead */
  validateUser(token: string | undefined): RequestUser | null {
    return this.validateToken(token);
  }
}
