import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, MaxLength } from 'class-validator';
import { TreatmentType } from '../../domain/virtual-records';

export class CreateClinicalMedicationDto {
    @ApiProperty({
        description: 'Name of the medication',
        example: 'Metformina 850mg',
        maxLength: 500
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    mMedication: string;

    @ApiProperty({
        description: 'Dosage instructions',
        example: '1 tablet twice daily with meals',
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    mDosage: string;

    @ApiPropertyOptional({
        description: 'Type of treatment',
        enum: TreatmentType,
        example: TreatmentType.CHRONIC
    })
    @IsOptional()
    @IsEnum(TreatmentType)
    mTreatmentType?: TreatmentType;

    @ApiPropertyOptional({
        description: 'ID of the associated clinical history',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    idClinicalHistory?: number;
}
