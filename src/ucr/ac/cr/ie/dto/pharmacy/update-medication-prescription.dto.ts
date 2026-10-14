import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateMedicationPrescriptionDto } from './create-medication-prescription.dto';
import { PrescriptionStatus } from '../../domain/pharmacy';

export class UpdateMedicationPrescriptionDto extends PartialType(CreateMedicationPrescriptionDto) {
    @ApiPropertyOptional({ enum: PrescriptionStatus })
    @IsOptional()
    @IsEnum(PrescriptionStatus)
    status?: PrescriptionStatus;
}
