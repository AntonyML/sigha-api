import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PlatformGuard } from '../../common/guards';
import { Platform, SkipTenant } from '../../common/decorators';

@ApiTags('Plataforma')
@ApiBearerAuth('jwt')
@Controller('platform')
@UseGuards(JwtAuthGuard, PlatformGuard)
@Platform()
@SkipTenant()
export class PlatformController {
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
}
