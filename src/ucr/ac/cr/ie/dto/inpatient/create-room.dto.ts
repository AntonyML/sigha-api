import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({ example: 'HAB-104', description: 'Código único de habitación' })
    @IsNotEmpty()
    @IsString()
    roomNumber!: string;

    @ApiProperty({ example: 'Habitación 104 - Pabellón A', description: 'Nombre descriptivo de la habitación' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiPropertyOptional({ example: 'Piso 1 - Ala Norte', description: 'Piso o ala del edificio' })
    @IsOptional()
    @IsString()
    floorWing?: string;

    @ApiPropertyOptional({ example: 2, description: 'Capacidad de camas', default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @ApiPropertyOptional({ example: true, description: 'Estado activo de la habitación', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
