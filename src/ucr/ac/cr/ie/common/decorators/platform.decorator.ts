import { SetMetadata } from '@nestjs/common';

export const PLATFORM_KEY = 'platform';

/**
 * Marks a handler/controller as belonging to the SaaS platform plane.
 * Documentational only: enforcement lives in `PlatformGuard`.
 */
export const Platform = () => SetMetadata(PLATFORM_KEY, true);
