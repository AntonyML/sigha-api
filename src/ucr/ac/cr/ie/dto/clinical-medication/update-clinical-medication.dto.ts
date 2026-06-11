import { PartialType } from '@nestjs/swagger';
import { CreateClinicalMedicationDto } from './create-clinical-medication.dto';

export class UpdateClinicalMedicationDto extends PartialType(CreateClinicalMedicationDto) {}
