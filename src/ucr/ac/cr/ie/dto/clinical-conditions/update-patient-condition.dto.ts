import { PartialType } from '@nestjs/swagger';
import { CreatePatientConditionDto } from './create-patient-condition.dto';

export class UpdatePatientConditionDto extends PartialType(CreatePatientConditionDto) {}
