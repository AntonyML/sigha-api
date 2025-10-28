import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleChangeDto {
    @ApiProperty({
        description: 'Rol anterior del usuario',
        example: 'nurse'
    })
    @IsString({ message: 'El rol anterior debe ser una cadena de texto' })
    rcOldRole: string;

    @ApiProperty({
        description: 'Nuevo rol del usuario',
        example: 'physiotherapist'
    })
    @IsString({ message: 'El nuevo rol debe ser una cadena de texto' })
    rcNewRole: string;

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