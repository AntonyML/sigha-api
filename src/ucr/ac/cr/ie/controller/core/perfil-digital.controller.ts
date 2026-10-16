import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PerfilDigitalService } from '../../services/core/perfil-digital.service';
import {
  GuardarPerfilDigitalDto,
  CrearSeccionCampoDto,
  CrearDefinicionCampoDto,
} from '../../dto/perfil-digital';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Perfil Digital y Motor Dinámico de Campos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['perfil-digital', 'digital-profiles'])
export class PerfilDigitalController {
  constructor(private readonly perfilDigitalService: PerfilDigitalService) {}

  @Get('plantilla/vigente')
  @ApiOperation({ summary: 'Obtener la plantilla activa y su esquema de campos por rol' })
  @ApiQuery({ name: 'rol', required: false, default: 'RESIDENTE' })
  async getPlantillaVigente(@Query('rol') rol: string = 'RESIDENTE', @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.obtenerPlantillaVigente(rol, tenantId);
  }

  @Get(':perfilId')
  @ApiOperation({ summary: 'Consultar el perfil digital (datos JSONB y esquema renderizable) por ID de perfil' })
  async getByPerfilId(@Param('perfilId') perfilId: string, @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.obtenerPorPerfilId(perfilId, tenantId);
  }

  @Put(':perfilId')
  @ApiOperation({ summary: 'Guardar o actualizar datos dinámicos JSONB del perfil digital' })
  async saveDatos(
    @Param('perfilId') perfilId: string,
    @Body() dto: GuardarPerfilDigitalDto,
    @Req() req: any,
  ) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.guardarDatos(perfilId, dto, tenantId);
  }

  @Post('secciones')
  @ApiOperation({ summary: 'Crear una nueva sección de campos dentro de una plantilla' })
  async createSeccion(@Body() dto: CrearSeccionCampoDto, @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.crearSeccion(dto, tenantId);
  }

  @Post('campos')
  @ApiOperation({ summary: 'Agregar una nueva definición de campo dinámico configurable' })
  async createCampo(@Body() dto: CrearDefinicionCampoDto, @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.crearDefinicionCampo(dto, tenantId);
  }

  @Patch('campos/:id')
  @ApiOperation({ summary: 'Actualizar configuración de un campo dinámico' })
  async updateCampo(
    @Param('id') id: string,
    @Body() dto: Partial<CrearDefinicionCampoDto>,
    @Req() req: any,
  ) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.perfilDigitalService.actualizarDefinicionCampo(id, dto, tenantId);
  }

  @Delete('campos/:id')
  @ApiOperation({ summary: 'Eliminación lógica de un campo dinámico de la interfaz' })
  async deleteCampo(@Param('id') id: string, @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    await this.perfilDigitalService.eliminarDefinicionCampo(id, tenantId);
    return { success: true, message: `Campo ${id} eliminado correctamente` };
  }
}
