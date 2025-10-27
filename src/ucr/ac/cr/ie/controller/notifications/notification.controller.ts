import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '../../services/notifications';
import { CreateNotificationDto, UpdateNotificationDto, SearchNotificationDto } from '../../dto/notifications';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Notificaciones')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({
        summary: 'Crear nueva notificación',
        description: 'Crea una nueva notificación con posibles archivos adjuntos.'
    })
    @ApiResponse({
        status: 201,
        description: 'Notificación creada exitosamente'
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async create(@Body() createNotificationDto: CreateNotificationDto, @Request() req) {
        const userId = req?.user?.userId;
        return await this.notificationService.create(createNotificationDto, userId);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.SOCIAL_WORKER)
    @ApiOperation({
        summary: 'Listar notificaciones',
        description: 'Obtiene una lista paginada de notificaciones con filtros opcionales.'
    })
    @ApiQuery({ name: 'search', required: false, description: 'Término de búsqueda' })
    @ApiQuery({ name: 'sendDateFrom', required: false, description: 'Fecha inicio' })
    @ApiQuery({ name: 'sendDateTo', required: false, description: 'Fecha fin' })
    @ApiQuery({ name: 'nSent', required: false, description: 'Estado de envío' })
    @ApiQuery({ name: 'idSender', required: false, description: 'ID del remitente' })
    @ApiQuery({ name: 'page', required: false, description: 'Página' })
    @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
    @ApiResponse({
        status: 200,
        description: 'Lista de notificaciones obtenida exitosamente'
    })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async findAll(@Query() searchDto: SearchNotificationDto) {
        return await this.notificationService.findAll(searchDto);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.SOCIAL_WORKER)
    @ApiOperation({
        summary: 'Obtener notificación por ID',
        description: 'Obtiene los detalles de una notificación específica incluyendo adjuntos.'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación encontrada'
    })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
    async findOne(@Param('id') id: string) {
        return await this.notificationService.findOne(+id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({
        summary: 'Actualizar notificación',
        description: 'Actualiza una notificación existente.'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación actualizada exitosamente'
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
    async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
        const userId = req?.user?.userId;
        return await this.notificationService.update(+id, updateNotificationDto, userId);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({
        summary: 'Eliminar notificación',
        description: 'Elimina una notificación y sus adjuntos.'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación eliminada exitosamente'
    })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
    async remove(@Param('id') id: string, @Request() req) {
        const userId = req?.user?.userId;
        return await this.notificationService.remove(+id, userId);
    }
}