import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, ParseIntPipe, UseGuards, Request
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam
} from '@nestjs/swagger';
import { PermissionService } from '../../services/permissions/permission.service';
import { CreatePermissionDto, UpdatePermissionDto, UpdateRolePermissionsDto } from '../../dto/permissions';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Permissions')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // ──────────────── Catálogo de permisos ────────────────

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @ApiOperation({ summary: 'Listar todos los permisos del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @ApiOperation({ summary: 'Obtener permiso por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Permiso encontrado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findById(id);
  }

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear nuevo permiso (solo super admin)' })
  @ApiResponse({ status: 201, description: 'Permiso creado' })
  @ApiResponse({ status: 409, description: 'Ya existe un permiso con ese módulo y acción' })
  create(@Body() dto: CreatePermissionDto, @Request() req: any) {
    return this.permissionService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Actualizar permiso (solo super admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Permiso actualizado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
    @Request() req: any,
  ) {
    return this.permissionService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Eliminar permiso (solo super admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Permiso eliminado' })
  @ApiResponse({ status: 400, description: 'Permiso en uso — no se puede eliminar' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.permissionService.remove(id, req.user.id);
  }

  // ──────────────── Permisos por rol ────────────────

  @Get('role/:roleId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @ApiOperation({ summary: 'Obtener todos los permisos asignados a un rol' })
  @ApiParam({ name: 'roleId', type: Number })
  @ApiResponse({ status: 200, description: 'Permisos del rol' })
  getByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionService.getPermissionsByRole(roleId);
  }

  @Put('role/:roleId')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reemplazar todos los permisos de un rol (solo super admin)' })
  @ApiParam({ name: 'roleId', type: Number })
  @ApiResponse({ status: 200, description: 'Permisos del rol actualizados' })
  setRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: UpdateRolePermissionsDto,
    @Request() req: any,
  ) {
    return this.permissionService.setRolePermissions(roleId, dto, req.user.id);
  }

  @Patch('role/:roleId/permission/:permissionId/grant')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Conceder un permiso a un rol' })
  grantPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Request() req: any,
  ) {
    return this.permissionService.toggleRolePermission(roleId, permissionId, true, req.user.id);
  }

  @Patch('role/:roleId/permission/:permissionId/revoke')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Revocar un permiso de un rol' })
  revokePermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Request() req: any,
  ) {
    return this.permissionService.toggleRolePermission(roleId, permissionId, false, req.user.id);
  }
}
