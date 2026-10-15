import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsString,
    Min,
    Max,
    IsArray,
    ArrayMinSize,
    ArrayMaxSize,
    IsBoolean,
} from 'class-validator';

export class CreatePsychologyEvaluationDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del encuentro clínico asociado' })
    @IsOptional()
    @IsInt()
    idEncounter?: number;

    @ApiPropertyOptional({ example: 3, description: 'Puntaje Escala Yesavage GDS de depresión geriátrica (0-15)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(15)
    yesavageGdsScore?: number;

    @ApiPropertyOptional({
        type: [Boolean],
        description: '15 respuestas ya puntuadas para Yesavage; true indica respuesta que suma un punto',
        minItems: 15,
        maxItems: 15,
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(15)
    @ArrayMaxSize(15)
    @IsBoolean({ each: true })
    yesavageResponses?: boolean[];

    @ApiPropertyOptional({ example: 1, description: 'Número de errores en cuestionario Pfeiffer SPMSQ (0-10)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    pfeifferErrorsScore?: number;

    @ApiPropertyOptional({
        type: [Boolean],
        description: '10 respuestas puntuadas para Pfeiffer; true indica respuesta incorrecta',
        minItems: 10,
        maxItems: 10,
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(10)
    @ArrayMaxSize(10)
    @IsBoolean({ each: true })
    pfeifferResponses?: boolean[];

    @ApiPropertyOptional({ example: 'Eutímico, orientado en tiempo, espacio y persona', description: 'Estado emocional observado' })
    @IsOptional()
    @IsString()
    emotionalState?: string;

    @ApiPropertyOptional({ example: 'Disposición activa para participar en actividades recreativas', description: 'Observaciones conductuales' })
    @IsOptional()
    @IsString()
    behavioralObservations?: string;

    @ApiPropertyOptional({ example: 'Talleres de estimulación cognitiva y acompañamiento emocional quincenal', description: 'Plan de intervención' })
    @IsOptional()
    @IsString()
    interventionPlan?: string;

    @ApiPropertyOptional({ example: 'Red de apoyo familiar presente en visitas de fin de semana', description: 'Notas adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}
