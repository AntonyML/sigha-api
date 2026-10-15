import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PlatformRole } from '../../domain/auth/core/user.entity';

const PLATFORM_ROLES: string[] = [PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_SUPPORT];

/**
 * Guard for the SaaS platform plane. Requires the authenticated user to carry a
 * platform role (`platformRole` claim), which is independent from any
 * organization role.
 */
@Injectable()
export class PlatformGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const platformRole = request?.user?.platformRole;

    if (typeof platformRole !== 'string' || !PLATFORM_ROLES.includes(platformRole)) {
      throw new ForbiddenException('Se requiere un rol de plataforma para acceder a este recurso');
    }

    return true;
  }
}
