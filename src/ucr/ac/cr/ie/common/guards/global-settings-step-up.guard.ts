import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';

interface GlobalSettingsRequest {
  user?: { userId?: number; id?: number; sub?: number };
  headers: Record<string, string | string[] | undefined>;
}

@Injectable()
export class GlobalSettingsStepUpGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GlobalSettingsRequest>();
    const rawUserId = request.user?.userId ?? request.user?.id ?? request.user?.sub;
    const token = request.headers['x-global-settings-token'];

    if (!Number.isInteger(rawUserId) || typeof token !== 'string' || !token) {
      throw new UnauthorizedException('Verifica tu código 2FA para continuar');
    }

    const isValid = await this.authService.validateGlobalSettingsStepUpToken(rawUserId as number, token);
    if (!isValid) {
      throw new UnauthorizedException('La verificación 2FA expiró; ingresa un código nuevo');
    }

    return true;
  }
}
