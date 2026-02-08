import { IsEnum, IsOptional, IsInt, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordType, VitalSignsStatus } from '../../domain/nursing';
import { Type } from 'class-transformer';

export class CreateMedicalRecordDto {
    @ApiProperty({
        description: 'Date and time of the medical record',
        example: '2025-02-08T10:00:00.000Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    record_date?: string;

    @ApiProperty({
        description: 'Type of medical record',
        enum: RecordType,
        example: RecordType.ROUTINE_CHECK
    })
    @IsEnum(RecordType)
    record_type: RecordType;

    @ApiPropertyOptional({
        description: 'Chief complaint or reason for visit',
        example: 'Patient reports chest pain and shortness of breath'
    })
    @IsOptional()
    @IsString()
    chief_complaint?: string;

    @ApiPropertyOptional({
        description: 'Patient medical history',
        example: 'Hypertension, diabetes type 2, previous heart surgery'
    })
    @IsOptional()
    @IsString()
    medical_history?: string;

    @ApiPropertyOptional({
        description: 'Current medications',
        example: 'Lisinopril 10mg daily, Metformin 500mg twice daily'
    })
    @IsOptional()
    @IsString()
    current_medications?: string;

    @ApiPropertyOptional({
        description: 'Known allergies',
        example: 'Penicillin, sulfa drugs'
    })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiPropertyOptional({
        description: 'Body temperature in Celsius',
        example: 36.8,
        minimum: 30,
        maximum: 45
    })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(45)
    temperature?: number;

    @ApiPropertyOptional({
        description: 'Systolic blood pressure (mmHg)',
        example: 120,
        minimum: 60,
        maximum: 250
    })
    @IsOptional()
    @IsInt()
    @Min(60)
    @Max(250)
    blood_pressure_systolic?: number;

    @ApiPropertyOptional({
        description: 'Diastolic blood pressure (mmHg)',
        example: 80,
        minimum: 40,
        maximum: 150
    })
    @IsOptional()
    @IsInt()
    @Min(40)
    @Max(150)
    blood_pressure_diastolic?: number;

    @ApiPropertyOptional({
        description: 'Heart rate (beats per minute)',
        example: 72,
        minimum: 30,
        maximum: 200
    })
    @IsOptional()
    @IsInt()
    @Min(30)
    @Max(200)
    heart_rate?: number;

    @ApiPropertyOptional({
        description: 'Respiratory rate (breaths per minute)',
        example: 16,
        minimum: 8,
        maximum: 40
    })
    @IsOptional()
    @IsInt()
    @Min(8)
    @Max(40)
    respiratory_rate?: number;

    @ApiPropertyOptional({
        description: 'Weight in kilograms',
        example: 75.5,
        minimum: 20,
        maximum: 300
    })
    @IsOptional()
    @IsNumber()
    @Min(20)
    @Max(300)
    weight_kg?: number;

    @ApiPropertyOptional({
        description: 'Height in centimeters',
        example: 170.5,
        minimum: 50,
        maximum: 250
    })
    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(250)
    height_cm?: number;

    @ApiPropertyOptional({
        description: 'Vital signs status',
        enum: VitalSignsStatus,
        example: VitalSignsStatus.NORMAL
    })
    @IsOptional()
    @IsEnum(VitalSignsStatus)
    vital_signs_status?: VitalSignsStatus;

    @ApiPropertyOptional({
        description: 'Physical examination findings',
        example: 'Heart: regular rhythm, no murmurs. Lungs: clear to auscultation.'
    })
    @IsOptional()
    @IsString()
    physical_examination?: string;

    @ApiPropertyOptional({
        description: 'Medical diagnosis',
        example: 'Acute bronchitis, Hypertension stage 1'
    })
    @IsOptional()
    @IsString()
    diagnosis?: string;

    @ApiPropertyOptional({
        description: 'Treatment plan',
        example: 'Antibiotics for 7 days, continue current hypertension medication'
    })
    @IsOptional()
    @IsString()
    treatment_plan?: string;

    @ApiPropertyOptional({
        description: 'Prescribed medications',
        example: 'Amoxicillin 500mg three times daily for 7 days'
    })
    @IsOptional()
    @IsString()
    prescribed_medications?: string;

    @ApiPropertyOptional({
        description: 'Laboratory tests ordered',
        example: 'Complete blood count, chest X-ray, lipid profile'
    })
    @IsOptional()
    @IsString()
    laboratory_tests?: string;

    @ApiPropertyOptional({
        description: 'Imaging studies ordered',
        example: 'Chest X-ray, echocardiogram'
    })
    @IsOptional()
    @IsString()
    imaging_studies?: string;

    @ApiPropertyOptional({
        description: 'Follow-up instructions',
        example: 'Return in 2 weeks or sooner if symptoms worsen'
    })
    @IsOptional()
    @IsString()
    follow_up_instructions?: string;

    @ApiPropertyOptional({
        description: 'Additional notes',
        example: 'Patient educated on medication compliance and lifestyle modifications'
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: 'ID of the patient',
        example: 1
    })
    @IsInt()
    @Type(() => Number)
    patient_id: number;
}

export class UpdateMedicalRecordDto {
    @ApiPropertyOptional({
        description: 'Date and time of the medical record',
        example: '2025-02-08T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    record_date?: string;

    @ApiPropertyOptional({
        description: 'Type of medical record',
        enum: RecordType,
        example: RecordType.FOLLOW_UP
    })
    @IsOptional()
    @IsEnum(RecordType)
    record_type?: RecordType;

    @ApiPropertyOptional({
        description: 'Chief complaint or reason for visit',
        example: 'Updated symptoms description'
    })
    @IsOptional()
    @IsString()
    chief_complaint?: string;

    @ApiPropertyOptional({
        description: 'Patient medical history',
        example: 'Updated medical history with new conditions'
    })
    @IsOptional()
    @IsString()
    medical_history?: string;

    @ApiPropertyOptional({
        description: 'Current medications',
        example: 'Updated medication list'
    })
    @IsOptional()
    @IsString()
    current_medications?: string;

    @ApiPropertyOptional({
        description: 'Known allergies',
        example: 'Updated allergy information'
    })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiPropertyOptional({
        description: 'Body temperature in Celsius',
        example: 37.2
    })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(45)
    temperature?: number;

    @ApiPropertyOptional({
        description: 'Systolic blood pressure (mmHg)',
        example: 125
    })
    @IsOptional()
    @IsInt()
    @Min(60)
    @Max(250)
    blood_pressure_systolic?: number;

    @ApiPropertyOptional({
        description: 'Diastolic blood pressure (mmHg)',
        example: 85
    })
    @IsOptional()
    @IsInt()
    @Min(40)
    @Max(150)
    blood_pressure_diastolic?: number;

    @ApiPropertyOptional({
        description: 'Heart rate (beats per minute)',
        example: 75
    })
    @IsOptional()
    @IsInt()
    @Min(30)
    @Max(200)
    heart_rate?: number;

    @ApiPropertyOptional({
        description: 'Respiratory rate (breaths per minute)',
        example: 18
    })
    @IsOptional()
    @IsInt()
    @Min(8)
    @Max(40)
    respiratory_rate?: number;

    @ApiPropertyOptional({
        description: 'Weight in kilograms',
        example: 76.0
    })
    @IsOptional()
    @IsNumber()
    @Min(20)
    @Max(300)
    weight_kg?: number;

    @ApiPropertyOptional({
        description: 'Height in centimeters',
        example: 170.5
    })
    @IsOptional()
    @IsNumber()
    @Min(50)
    @Max(250)
    height_cm?: number;

    @ApiPropertyOptional({
        description: 'Vital signs status',
        enum: VitalSignsStatus,
        example: VitalSignsStatus.ABNORMAL
    })
    @IsOptional()
    @IsEnum(VitalSignsStatus)
    vital_signs_status?: VitalSignsStatus;

    @ApiPropertyOptional({
        description: 'Physical examination findings',
        example: 'Updated examination results'
    })
    @IsOptional()
    @IsString()
    physical_examination?: string;

    @ApiPropertyOptional({
        description: 'Medical diagnosis',
        example: 'Updated diagnosis based on new tests'
    })
    @IsOptional()
    @IsString()
    diagnosis?: string;

    @ApiPropertyOptional({
        description: 'Treatment plan',
        example: 'Revised treatment plan'
    })
    @IsOptional()
    @IsString()
    treatment_plan?: string;

    @ApiPropertyOptional({
        description: 'Prescribed medications',
        example: 'Updated prescription'
    })
    @IsOptional()
    @IsString()
    prescribed_medications?: string;

    @ApiPropertyOptional({
        description: 'Laboratory tests ordered',
        example: 'Additional tests ordered'
    })
    @IsOptional()
    @IsString()
    laboratory_tests?: string;

    @ApiPropertyOptional({
        description: 'Imaging studies ordered',
        example: 'Additional imaging studies'
    })
    @IsOptional()
    @IsString()
    imaging_studies?: string;

    @ApiPropertyOptional({
        description: 'Follow-up instructions',
        example: 'Updated follow-up instructions'
    })
    @IsOptional()
    @IsString()
    follow_up_instructions?: string;

    @ApiPropertyOptional({
        description: 'Additional notes',
        example: 'Updated clinical notes'
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class MedicalRecordFilterDto {
    @ApiPropertyOptional({
        description: 'Filter by patient ID',
        example: 1
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    patientId?: number;

    @ApiPropertyOptional({
        description: 'Filter by record type',
        enum: RecordType,
        example: RecordType.ROUTINE_CHECK
    })
    @IsOptional()
    @IsEnum(RecordType)
    recordType?: RecordType;
}