import { ApiProperty } from '@nestjs/swagger';

export class RoleCompactDto {
    @ApiProperty({ example: 5, description: 'ID del rol en la tabla `roles`' })
    roleId: number;

    @ApiProperty({ example: 'nurse', description: 'Nombre canónico del rol (`r_name`)' })
    roleName: string;

    @ApiProperty({ example: true, description: 'Indica si es el rol primario del usuario' })
    isPrimary: boolean;
}

export class UserRolesResponseDto {
    @ApiProperty({ example: 7, description: 'ID del usuario consultado' })
    userId: number;

    @ApiProperty({ type: [RoleCompactDto] })
    roles: RoleCompactDto[];
}
