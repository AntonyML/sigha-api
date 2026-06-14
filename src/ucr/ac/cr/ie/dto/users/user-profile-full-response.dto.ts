import { ApiProperty } from '@nestjs/swagger';
import { RoleCompactDto } from './user-roles-response.dto';
import { PermissionCompactDto } from './user-permissions-response.dto';

export class UserFullProfileDto {
    @ApiProperty({ description: 'Snapshot del usuario (`User` entity sin password)' })
    user: Record<string, unknown>;

    @ApiProperty({ type: [RoleCompactDto] })
    roles: RoleCompactDto[];

    @ApiProperty({ type: [PermissionCompactDto] })
    permissions: PermissionCompactDto[];
}

export class UserProfileFullResponseDto {
    @ApiProperty({ description: 'Snapshot del usuario (`User` entity sin password)' })
    user: Record<string, unknown>;

    @ApiProperty({ type: [RoleCompactDto] })
    roles: RoleCompactDto[];

    @ApiProperty({ type: [PermissionCompactDto] })
    permissions: PermissionCompactDto[];
}
