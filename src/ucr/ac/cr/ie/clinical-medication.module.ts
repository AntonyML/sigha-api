import { Module } from '@nestjs/common';
import { ClinicalMedicationController } from './controller/clinical-medication/clinical-medication.controller';
import { ClinicalMedicationService } from './services/clinical-medication/clinical-medication.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ClinicalMedicationController],
    providers: [
        ClinicalMedicationService,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'ClinicalMedicationRepository'
        ),
    ],
    exports: [ClinicalMedicationService],
})
export class ClinicalMedicationModule {}
