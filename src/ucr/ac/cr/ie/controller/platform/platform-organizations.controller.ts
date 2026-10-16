import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, PlatformGuard, PlatformStepUpGuard } from '../../common/guards';
import { Platform, SkipTenant } from '../../common/decorators';
import { PlatformOrganizationsService } from '../../services/platform/platform-organizations.service';
import { CreatePlatformOrganizationDto } from './dto/create-platform-organization.dto';
import { UpdatePlatformOrganizationDto } from './dto/update-platform-organization.dto';

interface PlatformUserRequest {
  user?: { userId?: number; id?: number };
}

function actorId(req: PlatformUserRequest): number {
  return (req.user?.userId ?? req.user?.id) as number;
}

@ApiTags('Plataforma - Organizaciones')
@ApiBearerAuth('jwt')
@Controller('platform/organizations')
@UseGuards(JwtAuthGuard, PlatformGuard)
@Platform()
@SkipTenant()
export class PlatformOrganizationsController {
  constructor(
    private readonly organizationsService: PlatformOrganizationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las organizaciones',
    description:
      'Vista platform-wide de las organizaciones con su estado, plan y número de miembros.',
  })
  @ApiResponse({ status: 200, description: 'Organizaciones listadas' })
  @ApiResponse({ status: 403, description: 'Sin rol de plataforma' })
  list() {
    return this.organizationsService.listOrganizations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una organización' })
  @ApiResponse({ status: 200, description: 'Organización encontrada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.organizationsService.getOrganization(id);
  }

  @Post()
  @UseGuards(PlatformStepUpGuard)
  @ApiOperation({
    summary: 'Crear una organización',
    description:
      'Crea un nuevo tenant desde el plano de plataforma. Requiere re-verificación 2FA (x-platform-step-up-token).',
  })
  @ApiResponse({ status: 201, description: 'Organización creada' })
  @ApiResponse({ status: 409, description: 'El slug ya está en uso' })
  create(
    @Body() dto: CreatePlatformOrganizationDto,
    @Request() req: PlatformUserRequest,
  ) {
    return this.organizationsService.createOrganization(dto, actorId(req));
  }

  @Patch(':id')
  @UseGuards(PlatformStepUpGuard)
  @ApiOperation({
    summary: 'Actualizar una organización',
    description:
      'Actualiza nombre, estado, plan, bandera de tenant o branding. Requiere re-verificación 2FA (x-platform-step-up-token).',
  })
  @ApiResponse({ status: 200, description: 'Organización actualizada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlatformOrganizationDto,
    @Request() req: PlatformUserRequest,
  ) {
    return this.organizationsService.updateOrganization(id, dto, actorId(req));
  }
}
