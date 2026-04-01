import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator';
import type { RequestUser } from '../types/request-user.type';

/**
 * Role hierarchy — higher index = higher privilege.
 */
const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
};

/**
 * RolesGuard — Milestone 4 fine-grained RBAC.
 *
 * Algorithm:
 *  1. Read required roles from `@Roles(...)` metadata.
 *  2. Resolve the effective role for the current user:
 *     a. If the request contains a `projectId` param or body field, look up the
 *        user's ProjectMember record — project-level role takes precedence.
 *     b. Fall back to the org-level role stored in the JWT / request user.
 *  3. Allow access if the effective role rank >= minimum required rank.
 *  4. Org-level ADMIN always passes.
 *
 * Routes without `@Roles(...)` are not affected by this guard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser; params?: Record<string, string>; body?: Record<string, unknown> }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authenticated user required');
    }

    // Org-level ADMIN always has access.
    if (user.role === 'ADMIN') return true;

    // Attempt to resolve project context from route params or request body.
    // Only use an explicitly named 'projectId' param to avoid misinterpreting
    // resource-specific :id params on non-project routes.
    const projectId: string | undefined =
      request.params?.['projectId'] ??
      (request.body?.['projectId'] as string | undefined);

    let effectiveRole: Role = user.role;

    if (projectId) {
      const projectMember = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: user.userId } },
        select: { role: true },
      });

      if (projectMember) {
        // Project-level role overrides org-level role.
        effectiveRole = projectMember.role as Role;
      }
    }

    const effectiveRank = ROLE_RANK[effectiveRole] ?? 0;
    const minimumRank = Math.min(...requiredRoles.map((r) => ROLE_RANK[r] ?? 0));

    if (effectiveRank < minimumRank) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, effective: ${effectiveRole}`,
      );
    }

    return true;
  }
}
