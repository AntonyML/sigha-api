import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleChangeDto {
    @ApiPropertyOptional({
        description: 'Rol anterior del usuario (texto legado, opcional). Preferir oldRoleId.',
        example: 'nurse'
    })
    @IsOptional()
    @IsString({ message: 'El rol anterior debe ser una cadena de texto' })
    rcOldRole?: string;

    @ApiPropertyOptional({
        description: 'Nuevo rol del usuario (texto legado, opcional). Preferir newRoleId.',
        example: 'physiotherapist'
    })
    @IsOptional()
    @IsString({ message: 'El nuevo rol debe ser una cadena de texto' })
    rcNewRole?: string;

    @ApiPropertyOptional({
        description: 'ID del rol anterior (normalizado vía user_roles / roles).',
        example: 5
    })
    @IsOptional()
    @IsInt({ message: 'El ID del rol anterior debe ser un número entero' })
    oldRoleId?: number;

    @ApiPropertyOptional({
        description: 'ID del nuevo rol (normalizado vía user_roles / roles).',
        example: 6
    })
    @IsOptional()
    @IsInt({ message: 'El ID del nuevo rol debe ser un número entero' })
    newRoleId?: number;

    @ApiProperty({
        description: 'ID del usuario afectado',
        example: 5
    })
    @IsInt({ message: 'El ID del usuario debe ser un número entero' })
    idUser: number;

    @ApiPropertyOptional({
        description: 'ID del administrador que realizó el cambio',
        example: 1
    })
    @IsOptional()
    @IsInt({ message: 'El ID del administrador debe ser un número entero' })
    changedBy?: number;
}
