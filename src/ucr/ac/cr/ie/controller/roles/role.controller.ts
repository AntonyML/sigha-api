import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService, CreateRoleDto, UpdateRoleDto } from '../../services/roles/role.service';
import { JwtAuthGuard, RolesGuard, TwoFactorGuard } from '../../common/guards';
import { Roles, Require2FA } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class RoleController {
    constructor(private readonly roleService: RoleService) { }

    @Post()
    @Roles(RoleType.SUPER_ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Crear nuevo rol',
        description: 'Solo super admins pueden crear roles. Requiere 2FA.'
    })
    @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async create(@Body() createRoleDto: CreateRoleDto) {
        return await this.roleService.createRole(createRoleDto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Obtener todos los roles' })
    @ApiResponse({ status: 200, description: 'Lista de roles obtenida exitosamente' })
    async findAll() {
        return await this.roleService.findAll();
    }

    @Get('admin-roles')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Obtener roles administrativos' })
    @ApiResponse({ status: 200, description: 'Roles administrativos obtenidos exitosamente' })
    async getAdminRoles() {
        return await this.roleService.getAdminRoles();
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Obtener rol por ID' })
    @ApiResponse({ status: 200, description: 'Rol obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    async findOne(@Param('id') id: string) {
        return await this.roleService.findById(+id);
    }

    @Get(':id/is-admin')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Verificar si un rol es administrativo' })
    @ApiResponse({ status: 200, description: 'Verificación realizada exitosamente' })
    async isAdminRole(@Param('id') id: string) {
        const isAdmin = await this.roleService.isAdminRole(+id);
        return { isAdmin };
    }

    @Get(':id/requires-2fa')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Verificar si un rol requiere 2FA' })
    @ApiResponse({ status: 200, description: 'Verificación realizada exitosamente' })
    async requiresTwoFactor(@Param('id') id: string) {
        const requires2FA = await this.roleService.requiresTwoFactor(+id);
        return { requires2FA };
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Actualizar rol',
        description: 'Solo super admins pueden actualizar roles. Requiere 2FA.'
    })
    @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return await this.roleService.updateRole(+id, updateRoleDto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Eliminar rol',
        description: 'Solo super admins pueden eliminar roles. Requiere 2FA. No se pueden eliminar roles del sistema.'
    })
    @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente' })
    @ApiResponse({ status: 400, description: 'No se puede eliminar rol del sistema' })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    async remove(@Param('id') id: string) {
        return await this.roleService.deleteRole(+id);
    }

    @Post('initialize-system-roles')
    @Roles(RoleType.SUPER_ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Inicializar roles del sistema',
        description: 'Solo super admins pueden inicializar roles del sistema. Requiere 2FA.'
    })
    @ApiResponse({ status: 200, description: 'Roles del sistema inicializados exitosamente' })
    async initializeSystemRoles() {
        await this.roleService.initializeSystemRoles();
        return { success: true, message: 'Roles del sistema inicializados correctamente' };
    }
}