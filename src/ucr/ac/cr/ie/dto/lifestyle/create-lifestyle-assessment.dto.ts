import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    Min,
    Max
} from 'class-validator';

export class CreateLifestyleAssessmentDto {
    @ApiProperty({ example: 1, description: 'ID del Adulto Mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 'general', description: 'Tipo de dieta: general, soft, pureed, diabetic, low_sodium, renal, enteral, other' })
    @IsOptional()
    @IsString()
    dietType?: string;

    @ApiPropertyOptional({ example: 'regular', description: 'Consistencia o textura de los alimentos: regular, picada, papilla, líquida' })
    @IsOptional()
    @IsString()
    dietConsistency?: string;

    @ApiPropertyOptional({ example: 'Intolerancia a la lactosa', description: 'Alergias o intolerancias alimentarias' })
    @IsOptional()
    @IsString()
    dietAllergiesIntolerances?: string;

    @ApiPropertyOptional({ example: 4, description: 'Número de tomas o comidas al día (1 a 10)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    mealsPerDay?: number;

    @ApiPropertyOptional({ example: 'normal', description: 'Nivel de apetito: normal, reduced, increased, anorexic, variable' })
    @IsOptional()
    @IsString()
    appetite?: string;

    @ApiPropertyOptional({ example: 1500, description: 'Ingesta hídrica diaria estimada en ml' })
    @IsOptional()
    @IsInt()
    @Min(0)
    dailyFluidIntakeMl?: number;

    @ApiPropertyOptional({ example: false, description: 'Requiere espesante para líquidos por disfagia' })
    @IsOptional()
    @IsBoolean()
    requiresFluidThickener?: boolean;

    @ApiPropertyOptional({ example: 'Buena tolerancia gástrica', description: 'Observaciones de nutrición' })
    @IsOptional()
    @IsString()
    dietNotes?: string;

    @ApiPropertyOptional({ example: 7.0, description: 'Horas de sueño nocturno (0 a 24)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(24)
    sleepHoursPerNight?: number;

    @ApiPropertyOptional({ example: 'good', description: 'Calidad del sueño: good, fair, insomnia, fragmented, somnolence' })
    @IsOptional()
    @IsString()
    sleepQuality?: string;

    @ApiPropertyOptional({ example: false, description: 'Requiere medicación inductora del sueño' })
    @IsOptional()
    @IsBoolean()
    sleepMedicationRequired?: boolean;

    @ApiPropertyOptional({ example: 'Descanso continuo sin despertares', description: 'Notas sobre el sueño' })
    @IsOptional()
    @IsString()
    sleepNotes?: string;

    @ApiPropertyOptional({ example: 'sedentary', description: 'Nivel de actividad física: sedentary, light_assisted, moderate, active' })
    @IsOptional()
    @IsString()
    physicalActivityLevel?: string;

    @ApiPropertyOptional({ example: 20, description: 'Minutos de caminata diaria' })
    @IsOptional()
    @IsInt()
    @Min(0)
    dailyWalkingMinutes?: number;

    @ApiPropertyOptional({ example: false, description: 'Requiere asistencia de un auxiliar para la deambulación' })
    @IsOptional()
    @IsBoolean()
    mobilityAssistanceRequired?: boolean;

    @ApiPropertyOptional({ example: 'Camina con andadera por el pasillo central', description: 'Notas de movilidad' })
    @IsOptional()
    @IsString()
    physicalActivityNotes?: string;

    @ApiPropertyOptional({ example: 'never', description: 'Hábito tabáquico: never, former, active_light, active_heavy, passive' })
    @IsOptional()
    @IsString()
    smokingStatus?: string;

    @ApiPropertyOptional({ example: 0, description: 'Índice de paquetes/año' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    smokingPacksYear?: number;

    @ApiPropertyOptional({ example: 'never', description: 'Hábito de consumo de alcohol: never, former, occasional_social, risk_abuse' })
    @IsOptional()
    @IsString()
    alcoholStatus?: string;

    @ApiPropertyOptional({ example: 'Paciente con buenos hábitos alimentarios e hidratación adecuada.', description: 'Resumen o plan general' })
    @IsOptional()
    @IsString()
    lifestyleSummary?: string;
}
