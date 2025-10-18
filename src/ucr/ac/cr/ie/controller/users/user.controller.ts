import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../../services/users/user.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../../dto/users';
import { JwtAuthGuard, RolesGuard, TwoFactorGuard } from '../../common/guards';
import { Roles, Require2FA } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Crear nuevo usuario',
        description: 'Solo super admins y admins pueden crear usuarios. Requiere 2FA.'
    })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
    async findAll() {
        return await this.userService.findAll();
    }

    @Get('search')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiQuery({ name: 'term', description: 'Término de búsqueda' })
    @ApiOperation({ summary: 'Buscar usuarios' })
    @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente' })
    async searchUsers(@Query('term') searchTerm: string) {
        return await this.userService.searchUsers(searchTerm);
    }

    @Get('by-role/:roleId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Obtener usuarios por rol' })
    @ApiResponse({ status: 200, description: 'Usuarios del rol obtenidos exitosamente' })
    async findByRole(@Param('roleId') roleId: string) {
        return await this.userService.findByRole(+roleId);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil propio del usuario' })
    @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
    async getProfile(@Request() req) {
        return await this.userService.findById(req.user.userId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async findOne(@Param('id') id: string) {
        return await this.userService.findById(+id);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Actualizar perfil propio' })
    @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
    async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        // Los usuarios solo pueden actualizar ciertos campos de su propio perfil
        const allowedFields = {
            uName: updateUserDto.uName,
            uFLastName: updateUserDto.uFLastName,
            uSLastName: updateUserDto.uSLastName,
        };

        return await this.userService.updateUser(req.user.userId, allowedFields);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Actualizar usuario',
        description: 'Solo super admins y admins pueden actualizar usuarios. Requiere 2FA.'
    })
    @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(+id, updateUserDto);
    }

    @Post('change-password')
    @ApiOperation({ summary: 'Cambiar contraseña propia' })
    @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
    @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        return await this.userService.changePassword(req.user.userId, changePasswordDto);
    }

    @Patch(':id/toggle-status')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Activar/Desactivar usuario',
        description: 'Solo super admins y admins pueden cambiar el estado de usuarios. Requiere 2FA.'
    })
    @ApiResponse({ status: 200, description: 'Estado del usuario cambiado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async toggleStatus(@Param('id') id: string) {
        return await this.userService.toggleUserStatus(+id);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN)
    @Require2FA()
    @UseGuards(TwoFactorGuard)
    @ApiOperation({
        summary: 'Eliminar usuario (soft delete)',
        description: 'Solo super admins pueden eliminar usuarios. Requiere 2FA.'
    })
    @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async remove(@Param('id') id: string) {
        return await this.userService.deleteUser(+id);
    }
}