import { IsEnum, IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntranceExitType, AccessType } from '../../domain/entrances-exits/entrance-exit.entity';

export class CreateEntranceExitDto {
    @ApiProperty({
        description: 'Tipo de persona/entidad que ingresa/sale',
        enum: EntranceExitType,
        example: EntranceExitType.EMPLOYEE
    })
    @IsEnum(EntranceExitType, { message: 'El tipo debe ser uno de los valores válidos' })
    eeType: EntranceExitType;

    @ApiProperty({
        description: 'Tipo de acceso: entrada o salida',
        enum: AccessType,
        example: AccessType.ENTRANCE
    })
    @IsEnum(AccessType, { message: 'El tipo de acceso debe ser entrada o salida' })
    eeAccessType: AccessType;

    @ApiPropertyOptional({
        description: 'Número de identificación o placa',
        example: '12345678',
        maxLength: 20
    })
    @IsOptional()
    @IsString({ message: 'La identificación debe ser una cadena de texto' })
    @MaxLength(20, { message: 'La identificación no puede exceder 20 caracteres' })
    eeIdentification?: string;

    @ApiPropertyOptional({
        description: 'Nombre de la persona',
        example: 'Juan',
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    eeName?: string;

    @ApiPropertyOptional({
        description: 'Primer apellido',
        example: 'Pérez',
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'El primer apellido debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El primer apellido no puede exceder 50 caracteres' })
    eeFLastName?: string;

    @ApiPropertyOptional({
        description: 'Segundo apellido',
        example: 'González',
        maxLength: 50
    })
    @IsOptional()
    @IsString({ message: 'El segundo apellido debe ser una cadena de texto' })
    @MaxLength(50, { message: 'El segundo apellido no puede exceder 50 caracteres' })
    eeSLastName?: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora de entrada (ISO 8601)',
        example: '2025-10-21T08:30:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de entrada debe estar en formato ISO 8601' })
    eeDatetimeEntrance?: string;

    @ApiPropertyOptional({
        description: 'Fecha y hora de salida (ISO 8601)',
        example: '2025-10-21T17:30:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de salida debe estar en formato ISO 8601' })
    eeDatetimeExit?: string;

    @ApiPropertyOptional({
        description: 'Indica si el ciclo entrada-salida está cerrado',
        example: false
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo close debe ser un valor booleano' })
    eeClose?: boolean;

    @ApiPropertyOptional({
        description: 'Observaciones adicionales',
        example: 'Entrada normal de turno matutino'
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
    eeObservations?: string;
}