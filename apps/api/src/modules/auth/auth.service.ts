import { Injectable } from '@nestjs/common';
import type { RequestUser } from '../../common/types/request-user.type';

/**
 * Auth service — Milestone 2 development baseline.
 *
 * Provides a simple token-based user resolution suitable for development and
 * integration testing. JWT verification (passport-jwt / @nestjs/passport) will
 * replace this in Milestone 3.
 *
 * Development sentinel token:  "dev-token"
 * Any other non-empty token resolves to an engineer-level user.
 */
@Injectable()
export class AuthService {
  /**
   * Validate a bearer token and return a RequestUser principal.
   * Returns null if the token is absent or invalid.
   */
  validateToken(token: string | undefined): RequestUser | null {
    if (!token) return null;

    // Dev sentinel — resolves to admin user for local development convenience.
    if (token === 'dev-token') {
      return {
        userId: 'dev-user-admin',
        email: 'cmdr.lee@naval-systems.dev',
        organizationId: 'dev-org',
        role: 'ADMIN',
      };
    }

    // Any non-empty token resolves to a member-level user.
    // Replace with real JWT decode + DB lookup in M3.
    return {
      userId: 'dev-user-member',
      email: 'eng.chen@naval-systems.dev',
      organizationId: 'dev-org',
      role: 'MEMBER',
    };
  }

  /** @deprecated Use validateToken instead */
  validateUser(token: string | undefined): RequestUser | null {
    return this.validateToken(token);
  }
}
