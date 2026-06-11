import { IsOptional, IsInt, IsString, IsDateString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMedicalRecordDto {
    @ApiProperty({
        description: 'Date and time of the medical record',
        example: '2025-02-08T10:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    mr_record_date?: string;

    @ApiProperty({
        description: 'Clinical summary of the encounter (mandatory)',
        example: 'Paciente estable, sin nuevas complicaciones.',
    })
    @IsString()
    @Length(1, 4000)
    mr_summary: string;

    @ApiPropertyOptional({
        description: 'Diagnosis or differential diagnosis',
        example: 'Hipertensión controlada',
    })
    @IsOptional()
    @IsString()
    mr_diagnosis?: string;

    @ApiPropertyOptional({
        description: 'Treatment applied or recommended',
        example: 'Ajustar dosis de Losartán a 50mg/día',
    })
    @IsOptional()
    @IsString()
    mr_treatment?: string;

    @ApiPropertyOptional({
        description: 'General or inter-area observations',
        example: 'Seguimiento por enfermería en dos semanas',
    })
    @IsOptional()
    @IsString()
    mr_observations?: string;

    @ApiProperty({
        description: 'Origin area that generated the record (nursing, psychology, etc.)',
        example: 'nursing',
        maxLength: 60,
    })
    @IsString()
    @Length(1, 60)
    mr_origin_area: string;

    @ApiPropertyOptional({
        description: 'Name of the professional or digital signature',
        example: 'Lic. María Solís',
        maxLength: 150,
    })
    @IsOptional()
    @IsString()
    @Length(0, 150)
    mr_signed_by?: string;

    @ApiProperty({
        description: 'ID of the older adult (patient)',
        example: 1,
    })
    @IsInt()
    @Type(() => Number)
    id_older_adult: number;

    @ApiPropertyOptional({
        description: 'ID of the specialized appointment (optional, FK to specialized_appointment)',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_appointment?: number;

    @ApiPropertyOptional({
        description: 'ID of the staff member who created the record (FK to users, optional)',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_staff?: number;
}

export class UpdateMedicalRecordDto {
    @ApiPropertyOptional({
        description: 'Date and time of the medical record',
        example: '2025-02-08T10:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    mr_record_date?: string;

    @ApiPropertyOptional({
        description: 'Clinical summary of the encounter',
        example: 'Updated summary',
    })
    @IsOptional()
    @IsString()
    @Length(1, 4000)
    mr_summary?: string;

    @ApiPropertyOptional({
        description: 'Diagnosis or differential diagnosis',
    })
    @IsOptional()
    @IsString()
    mr_diagnosis?: string;

    @ApiPropertyOptional({
        description: 'Treatment applied or recommended',
    })
    @IsOptional()
    @IsString()
    mr_treatment?: string;

    @ApiPropertyOptional({
        description: 'General or inter-area observations',
    })
    @IsOptional()
    @IsString()
    mr_observations?: string;

    @ApiPropertyOptional({
        description: 'Origin area that generated the record',
        example: 'physiotherapy',
        maxLength: 60,
    })
    @IsOptional()
    @IsString()
    @Length(0, 60)
    mr_origin_area?: string;

    @ApiPropertyOptional({
        description: 'Name of the professional or digital signature',
        maxLength: 150,
    })
    @IsOptional()
    @IsString()
    @Length(0, 150)
    mr_signed_by?: string;

    @ApiPropertyOptional({
        description: 'ID of the specialized appointment',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_appointment?: number;

    @ApiPropertyOptional({
        description: 'ID of the staff member who created the record',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_staff?: number;
}

export class MedicalRecordFilterDto {
    @ApiPropertyOptional({
        description: 'Filter by older adult ID',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    olderAdultId?: number;

    @ApiPropertyOptional({
        description: 'Filter by origin area',
        example: 'nursing',
    })
    @IsOptional()
    @IsString()
    originArea?: string;
}
