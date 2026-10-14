import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_KEY = 'skipTenant';

/**
 * Decorator to explicitly exempt an endpoint or controller from TenantGuard requirements.
 */
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);
