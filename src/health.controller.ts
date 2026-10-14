import { Controller, Get } from '@nestjs/common';
import { Public } from './ucr/ac/cr/ie/common/decorators/public.decorator';

/**
 * Health check público para Render (healthCheckPath: /health).
 * No toca la base de datos: solo confirma que el proceso responde.
 * Debe seguir siendo @Public() aunque JwtAuthGuard sea global.
 */
@Public()
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
