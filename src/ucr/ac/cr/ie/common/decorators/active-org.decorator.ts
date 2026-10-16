import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract the active organization ID from the authenticated request.
 * Resolves from `req.activeOrgId` (set by TenantGuard) or `req.user.orgId` (from JWT).
 */
export const ActiveOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number | null => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.activeOrgId ?? request.user?.orgId;
    return orgId !== undefined && orgId !== null ? Number(orgId) : null;
  },
);
