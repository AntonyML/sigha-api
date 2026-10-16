import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonaService } from '../../services/core/persona.service';
import { CrearPersonaDto } from '../../dto/perfil-digital';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Personas y Sujetos de Atención')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller(['personas', 'people'])
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva Persona con su perfil y rol institucional' })
  @ApiResponse({ status: 201, description: 'Persona creada exitosamente' })
  async create(@Body() dto: CrearPersonaDto, @Req() req: any) {
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.personaService.crearPersona(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar personas registradas con soporte de filtros y paginación' })
  @ApiQuery({ name: 'rol', required: false, description: 'Filtrar por rol: RESIDENTE, PERSONAL, CONTACTO, etc.' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado del perfil: activo, inactivo, etc.' })
  @ApiQuery({ name: 'busqueda', required: false, description: 'Buscar por nombre o número de documento' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAll(
    @Query('rol') rol?: string,
    @Query('estado') estado?: string,
    @Query('busqueda') busqueda?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Req() req?: any,
  ) {
    const tenantId = Number(req?.activeOrgId || req?.user?.orgId || 1);
    return this.personaService.listarPersonas(tenantId, {
      rol,
      estado,
      busqueda,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información completa de una Persona por su ID (UUID)' })
  async getById(@Param('id') id: string) {
    return this.personaService.obtenerPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos generales y perfil de una persona' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CrearPersonaDto>,
  ) {
    return this.personaService.actualizarPersona(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Baja lógica (soft delete) de una persona y sus perfiles' })
  async remove(@Param('id') id: string) {
    await this.personaService.eliminarPersona(id);
    return { success: true, message: `Persona ${id} dada de baja correctamente` };
  }
}
