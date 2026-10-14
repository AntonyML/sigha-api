import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class AssignBedDto {
    @ApiProperty({ example: 1, description: 'ID del adulto mayor / paciente' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiProperty({ example: 1, description: 'ID de la habitación' })
    @IsNotEmpty()
    @IsInt()
    idRoom!: number;

    @ApiPropertyOptional({ example: 'Cama 1', description: 'Etiqueta o identificador de cama', default: 'Cama 1' })
    @IsOptional()
    @IsString()
    bedLabel?: string;

    @ApiPropertyOptional({ example: 'Asignado por indicación médica', description: 'Notas de la asignación' })
    @IsOptional()
    @IsString()
    notes?: string;
}
