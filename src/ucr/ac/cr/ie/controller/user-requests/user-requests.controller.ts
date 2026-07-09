import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRequestsService } from '../../services/user-requests';
import { CreateUserRequestDto } from '../../dto/user-requests';
import { Public } from '../../common/decorators';

@ApiTags('User Requests')
@Controller('user-requests')
export class UserRequestsController {
  constructor(private readonly userRequestsService: UserRequestsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3, blockDuration: 60000 } })
  @ApiOperation({
    summary: 'Enviar solicitud de creación de cuenta',
    description:
      'Un visitante sin cuenta envía sus datos para solicitar la creación de una cuenta. Se notifica a los administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tu solicitud fue enviada. Un administrador la revisará pronto.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o no hay administradores disponibles' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes. Intente de nuevo más tarde.' })
  async submitRequest(@Body() dto: CreateUserRequestDto, @Req() req: any) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    return this.userRequestsService.submitRequest(dto, ipAddress, userAgent);
  }
}