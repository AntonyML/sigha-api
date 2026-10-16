import {
  Body,
  Controller,
  Delete,
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
import {
  PlatformActor,
  PlatformOrganizationMembersService,
} from '../../services/platform/platform-organization-members.service';
import { CreatePlatformOrganizationMemberDto } from './dto/create-platform-organization-member.dto';
import { UpdatePlatformOrganizationMemberDto } from './dto/update-platform-organization-member.dto';

interface PlatformUserRequest {
  user?: {
    userId?: number;
    id?: number;
    platformRole?: PlatformActor['platformRole'];
  };
}

function actorFrom(req: PlatformUserRequest): PlatformActor {
  return {
    userId: (req.user?.userId ?? req.user?.id) as number,
    platformRole: req.user?.platformRole ?? null,
  };
}

@ApiTags('Plataforma - Membresías de organización')
@ApiBearerAuth('jwt')
@Controller('platform/organizations/:id/members')
@UseGuards(JwtAuthGuard, PlatformGuard)
@Platform()
@SkipTenant()
export class PlatformOrganizationMembersController {
  constructor(
    private readonly membersService: PlatformOrganizationMembersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar membresías de una organización',
    description:
      'Proyección [{userId,name,email,roleId,roleName,isPrimary,joinedAt}] sin paginación (v1). GET para PLATFORM_OWNER y PLATFORM_SUPPORT.',
  })
  @ApiResponse({ status: 200, description: 'Membresías listadas' })
  @ApiResponse({ status: 403, description: 'Sin rol de plataforma' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  list(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: PlatformUserRequest,
  ) {
    return this.membersService.listMembers(id, actorFrom(req));
  }

  @Post()
  @UseGuards(PlatformStepUpGuard)
  @ApiOperation({
    summary: 'Añadir una membresía',
    description:
      '404 si org/usuario/rol no existe; 409 si ya es miembro. Solo PLATFORM_OWNER. Requiere re-verificación 2FA (x-platform-step-up-token).',
  })
  @ApiResponse({ status: 201, description: 'Membresía creada' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro' })
  create(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePlatformOrganizationMemberDto,
    @Request() req: PlatformUserRequest,
  ) {
    return this.membersService.addMember(id, dto.userId, dto.roleId, actorFrom(req));
  }

  @Patch(':userId')
  @UseGuards(PlatformStepUpGuard)
  @ApiOperation({
    summary: 'Cambiar el rol de una membresía',
    description:
      '404 si no es miembro o el rol no existe. Solo PLATFORM_OWNER. Requiere re-verificación 2FA (x-platform-step-up-token).',
  })
  @ApiResponse({ status: 200, description: 'Membresía actualizada' })
  @ApiResponse({ status: 404, description: 'Membresía o rol no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdatePlatformOrganizationMemberDto,
    @Request() req: PlatformUserRequest,
  ) {
    return this.membersService.updateMemberRole(id, userId, dto.roleId, actorFrom(req));
  }

  @Delete(':userId')
  @UseGuards(PlatformStepUpGuard)
  @ApiOperation({
    summary: 'Eliminar una membresía',
    description:
      'Si era primaria y el usuario tiene otras, promueve la de joinedAt más antiguo en la misma transacción. Solo PLATFORM_OWNER. Requiere re-verificación 2FA (x-platform-step-up-token).',
  })
  @ApiResponse({ status: 200, description: 'Membresía eliminada' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: PlatformUserRequest,
  ) {
    return this.membersService.removeMember(id, userId, actorFrom(req));
  }
}
