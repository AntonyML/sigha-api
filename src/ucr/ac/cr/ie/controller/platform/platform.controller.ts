import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PlatformGuard } from '../../common/guards';
import { Platform, SkipTenant } from '../../common/decorators';
import { AuthService } from '../../services/auth/auth.service';
import { PlatformStepUpDto } from './dto/platform-step-up.dto';

@ApiTags('Plataforma')
@ApiBearerAuth('jwt')
@Controller('platform')
@UseGuards(JwtAuthGuard, PlatformGuard)
@Platform()
@SkipTenant()
export class PlatformController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health del plano de plataforma',
    description: 'Estado platform-wide (no tenant-scoped). Requiere un rol de plataforma.',
  })
  @ApiResponse({ status: 200, description: 'Estado de plataforma obtenido' })
  @ApiResponse({ status: 403, description: 'Sin rol de plataforma' })
  health(@Request() req: { user?: { platformRole?: string | null } }) {
    return {
      status: 'ok',
      service: 'sigha-api',
      scope: 'platform',
      platformRole: req.user?.platformRole ?? null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('step-up')
  @ApiOperation({
    summary: 'Re-verificar 2FA para operar la plataforma',
    description:
      'Valida un código TOTP y emite un token corto (5 minutos), ligado a un propósito, que las mutaciones de plataforma envían en x-platform-step-up-token.',
  })
  @ApiResponse({ status: 200, description: 'Token de step-up emitido' })
  @ApiResponse({ status: 401, description: 'Código 2FA inválido o expirado' })
  @ApiResponse({ status: 403, description: 'Sin rol de plataforma o sin 2FA habilitado' })
  stepUp(
    @Body() dto: PlatformStepUpDto,
    @Request() req: { user?: { userId?: number; id?: number } },
  ) {
    const userId = (req.user?.userId ?? req.user?.id) as number;
    return this.authService.createPlatformStepUpToken(userId, dto.code);
  }
}
