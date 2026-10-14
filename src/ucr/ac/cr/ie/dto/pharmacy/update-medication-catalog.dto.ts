import { PartialType } from '@nestjs/swagger';
import { CreateMedicationCatalogDto } from './create-medication-catalog.dto';

export class UpdateMedicationCatalogDto extends PartialType(CreateMedicationCatalogDto) {}
