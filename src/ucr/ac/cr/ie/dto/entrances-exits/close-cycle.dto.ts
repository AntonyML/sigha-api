import { IsDateString, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloseCycleDto {
    @ApiPropertyOptional({
        description: 'Fecha y hora de entrada (ISO 8601) - Solo si el registro original era de salida',
        example: '2025-10-21T08:00:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de entrada debe estar en formato ISO 8601' })
    eeDatetimeEntrance?: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora de salida (ISO 8601) - Solo si el registro original era de entrada',
        example: '2025-10-21T17:30:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de salida debe estar en formato ISO 8601' })
    eeDatetimeExit?: string;

    @ApiProperty({
        description: 'Observaciones adicionales para el cierre del ciclo',
        example: 'Ciclo cerrado por administrador - Registro de salida completado'
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    eeObservations?: string;

    @ApiProperty({
        description: 'Debe ser true para cerrar el ciclo',
        example: true
    })
    @IsBoolean({ message: 'El campo eeClose debe ser un valor booleano' })
    eeClose: boolean;
}