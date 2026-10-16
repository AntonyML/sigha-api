import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, SkipTenant, ActiveOrg } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Organizaciones')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
@SkipTenant()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('current')
  @ApiOperation({
    summary: 'Obtener organización activa',
    description: 'Devuelve los detalles de la organización activa presente en el token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organización activa obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        slug: { type: 'string' },
        logoUrl: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No hay organización activa en el token' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  async getCurrent(@ActiveOrg() orgId: number) {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en el token JWT');
    }
    return await this.organizationService.getCurrentOrganization(orgId);
  }

  @Patch('current')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @ApiOperation({
    summary: 'Actualizar organización activa',
    description: 'Permite al administrador de la organización actualizar su nombre.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organización actualizada exitosamente',
  })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  async updateCurrent(
    @ActiveOrg() orgId: number,
    @Body() dto: UpdateOrganizationDto,
  ) {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en el token JWT');
    }
    return await this.organizationService.updateCurrentOrganization(orgId, dto);
  }

  @Post('current/logo')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir logo de la organización activa',
    description: 'Permite subir un archivo de imagen (PNG, JPEG, WebP hasta 2MB) que se almacena y actualiza como logo_url.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (PNG, JPEG o WebP, máx 2MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logo actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o excede el límite' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  async uploadLogo(
    @ActiveOrg() orgId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!orgId) {
      throw new BadRequestException('No hay organización activa en el token JWT');
    }
    return await this.organizationService.uploadLogo(orgId, file);
  }
}
