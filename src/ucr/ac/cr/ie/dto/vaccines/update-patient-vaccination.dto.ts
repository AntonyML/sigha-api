import { PartialType } from '@nestjs/swagger';
import { CreatePatientVaccinationDto } from './create-patient-vaccination.dto';

export class UpdatePatientVaccinationDto extends PartialType(CreatePatientVaccinationDto) {}
