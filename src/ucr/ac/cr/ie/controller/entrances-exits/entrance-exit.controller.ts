import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EntranceExitService } from '../../services/entrances-exits/entrance-exit.service';
import { CreateEntranceExitDto, UpdateEntranceExitDto, SearchEntranceExitDto, CloseCycleDto } from '../../dto/entrances-exits';
import { JwtAuthGuard, RolesGuard, TwoFactorGuard } from '../../common/guards';
import { Roles, Require2FA } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Entradas y Salidas')
@Controller('entrances-exits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class EntranceExitController {
    constructor(private readonly entranceExitService: EntranceExitService) { }

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.SOCIAL_WORKER)
    @ApiOperation({
        summary: 'Registrar nueva entrada o salida',
        description: 'Crea un nuevo registro de entrada o salida al hogar. Adaptable para empleados, adultos mayores, visitantes, voluntarios, vehículos, etc. El frontend debe enviar los datos correctos según el tipo de acceso (entrance/exit).'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Registro de entrada/salida creado exitosamente',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                eeType: { type: 'string', example: 'employee' },
                eeAccessType: { type: 'string', example: 'entrance' },
                eeIdentification: { type: 'string', example: '12345678' },
                eeName: { type: 'string', example: 'Juan' },
                eeFLastName: { type: 'string', example: 'Pérez' },
                eeSLastName: { type: 'string', example: 'González' },
                eeDatetimeEntrance: { type: 'string', example: '2025-10-21T08:30:00.000Z' },
                eeDatetimeExit: { type: 'string', example: null },
                eeClose: { type: 'boolean', example: false },
                eeObservations: { type: 'string', example: 'Entrada normal de turno matutino' },
                createAt: { type: 'string', example: '2025-10-21T08:30:15.000Z' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos o reglas de negocio no cumplidas' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async create(@Body() createEntranceExitDto: CreateEntranceExitDto) {
        return await this.entranceExitService.create(createEntranceExitDto);
    }

    @Patch(':id/close-cycle')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.SOCIAL_WORKER)
    @ApiOperation({
        summary: 'Cerrar ciclo de entrada/salida',
        description: 'Completa la información faltante de un registro abierto y lo cierra. Si el registro original era de entrada, debe completar con fecha de salida. Si era de salida, debe completar con fecha de entrada. Solo se pueden modificar la fecha faltante y agregar observaciones.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Ciclo cerrado exitosamente',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                eeType: { type: 'string', example: 'employee' },
                eeAccessType: { type: 'string', example: 'entrance' },
                eeIdentification: { type: 'string', example: '12345678' },
                eeName: { type: 'string', example: 'Juan' },
                eeFLastName: { type: 'string', example: 'Pérez' },
                eeSLastName: { type: 'string', example: 'González' },
                eeDatetimeEntrance: { type: 'string', example: '2025-10-21T08:30:00.000Z' },
                eeDatetimeExit: { type: 'string', example: '2025-10-21T17:30:00.000Z' },
                eeClose: { type: 'boolean', example: true },
                eeObservations: { type: 'string', example: 'Entrada normal | Ciclo cerrado por administrador' },
                createAt: { type: 'string', example: '2025-10-21T08:30:15.000Z' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos, ciclo ya cerrado, o reglas de negocio no cumplidas' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado' })
    async closeCycle(
        @Param('id') id: string, 
        @Body() closeCycleDto: CloseCycleDto
    ) {
        return await this.entranceExitService.closeCycle(+id, closeCycleDto);
    }
}