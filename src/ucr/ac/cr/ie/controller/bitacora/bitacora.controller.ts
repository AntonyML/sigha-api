import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BitacoraService } from '../../services/bitacora/bitacora.service';
import {
  CrearBitacoraEntradaDto,
  ActualizarEstadoBitacoraDto,
  RegistrarAcuseBitacoraDto,
} from '../../dto/bitacora';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bitácora y Notas Operativas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva entrada en la bitácora operativa' })
  @ApiResponse({ status: 201, description: 'Entrada creada exitosamente' })
  async create(@Body() dto: CrearBitacoraEntradaDto, @Req() req: any) {
    const userId = Number(req.user?.userId || req.user?.id || 1);
    const tenantId = Number(req.activeOrgId || req.user?.orgId || 1);
    return this.bitacoraService.crearEntrada(dto, userId, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las entradas de bitácora del centro/organización' })
  async getAll(
    @Query('categoria') categoria?: string,
    @Query('visibilidad') visibilidad?: string,
    @Query('urgencia') urgencia?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Req() req?: any,
  ) {
    const tenantId = Number(req?.activeOrgId || req?.user?.orgId || 1);
    return this.bitacoraService.obtenerTodas(tenantId, {
      categoria,
      visibilidad,
      urgencia,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('perfil/:id')
  @ApiOperation({ summary: 'Obtener entradas de bitácora asociadas a un perfil específico' })
  async getByPerfil(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    const role = req.user?.role || req.user?.roleName;
    return this.bitacoraService.obtenerPorPerfil(id, userId, role);
  }

  // Alias for backward compatibility with existing frontend
  @Get('older-adult/:id')
  @ApiOperation({ summary: 'Alias de compatibilidad: obtener entradas de un residente' })
  async getByOlderAdult(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    const role = req.user?.role || req.user?.roleName;
    return this.bitacoraService.obtenerPorPerfil(id, userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una entrada específica por ID' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.bitacoraService.obtenerPorId(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la entrada (publicado, resuelto, archivado)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoBitacoraDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user?.userId || req.user?.id || 1);
    return this.bitacoraService.actualizarEstado(id, dto, userId);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Registrar acuse de recibo de lectura' })
  async acknowledge(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarAcuseBitacoraDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user?.userId || req.user?.id || 1);
    return this.bitacoraService.registrarAcuse(id, userId, dto);
  }
}
