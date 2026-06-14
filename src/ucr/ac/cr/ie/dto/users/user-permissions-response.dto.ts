import { ApiProperty } from '@nestjs/swagger';

export class PermissionCompactDto {
    @ApiProperty({ example: 12, description: 'ID del permiso en la tabla `permissions`' })
    permissionId: number;

    @ApiProperty({ example: 'users:view', description: 'Código `module:action` del permiso' })
    code: string;

    @ApiProperty({ example: 'Permite ver la lista de usuarios del sistema', description: 'Descripción del permiso' })
    description: string;
}

export class UserPermissionsResponseDto {
    @ApiProperty({ example: 7, description: 'ID del usuario consultado' })
    userId: number;

    @ApiProperty({ type: [PermissionCompactDto] })
    permissions: PermissionCompactDto[];
}
