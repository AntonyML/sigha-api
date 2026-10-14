import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateSocialWorkEvaluationDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del encuentro clínico asociado' })
    @IsOptional()
    @IsInt()
    idEncounter?: number;

    @ApiProperty({ example: 22, description: 'ID del trabajador social evaluador' })
    @IsNotEmpty()
    @IsInt()
    evaluatorId!: number;

    @ApiProperty({ example: 2, description: 'Adaptación en APGAR familiar (0=Casi nunca, 1=A veces, 2=Casi siempre)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 1, 2])
    apgarAdaptation!: number;

    @ApiProperty({ example: 2, description: 'Participación en APGAR familiar (0, 1, 2)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 1, 2])
    apgarPartnership!: number;

    @ApiProperty({ example: 2, description: 'Gradiente de desarrollo/crecimiento (0, 1, 2)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 1, 2])
    apgarGrowth!: number;

    @ApiProperty({ example: 2, description: 'Afecto (0, 1, 2)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 1, 2])
    apgarAffection!: number;

    @ApiProperty({ example: 2, description: 'Resolución (0, 1, 2)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 1, 2])
    apgarResolve!: number;

    @ApiPropertyOptional({ example: 'Hijo mayor asiste periódicamente; comunicación telefónica constante', description: 'Red de apoyo familiar y comunitaria' })
    @IsOptional()
    @IsString()
    familySupportNetwork?: string;

    @ApiPropertyOptional({ example: 'Pensión régimen no contributivo CCSS, subsidio complementario', description: 'Evaluación socioeconómica' })
    @IsOptional()
    @IsString()
    socioeconomicAssessment?: string;

    @ApiPropertyOptional({ example: 'Mantener vínculo activo con familiares y promover videollamadas', description: 'Recomendaciones institucionales' })
    @IsOptional()
    @IsString()
    institutionalRecommendations?: string;

    @ApiPropertyOptional({ example: 'Entrevista realizada en presencia del familiar de contacto', description: 'Notas adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}
