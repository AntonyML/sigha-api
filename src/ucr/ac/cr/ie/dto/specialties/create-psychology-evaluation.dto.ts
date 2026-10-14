import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreatePsychologyEvaluationDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del encuentro clínico asociado' })
    @IsOptional()
    @IsInt()
    idEncounter?: number;

    @ApiProperty({ example: 22, description: 'ID del psicólogo evaluador' })
    @IsNotEmpty()
    @IsInt()
    evaluatorId!: number;

    @ApiPropertyOptional({ example: 3, description: 'Puntaje Escala Yesavage GDS de depresión geriátrica (0-15)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(15)
    yesavageGdsScore?: number;

    @ApiPropertyOptional({ example: 1, description: 'Número de errores en cuestionario Pfeiffer SPMSQ (0-10)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    pfeifferErrorsScore?: number;

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
