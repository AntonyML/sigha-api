import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClinicalConditionsController } from './controller/clinical-conditions';
import { ClinicalConditionsService } from './services/clinical-conditions/clinical-conditions.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';
import { Icd10Catalog, PatientCondition } from './domain/clinical-conditions';

export const clinicalConditionsProviders = [
    {
        provide: 'Icd10CatalogRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Icd10Catalog),
        inject: ['DataSource'],
    },
    {
        provide: 'PatientConditionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PatientCondition),
        inject: ['DataSource'],
    },
];

@Module({
    imports: [DatabaseModule],
    controllers: [ClinicalConditionsController],
    providers: [
        ClinicalConditionsService,
        ...clinicalConditionsProviders,
        ...virtualRecordsProviders.filter(provider => 
            provider.provide === 'ClinicalConditionRepository' ||
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [ClinicalConditionsService],
})
export class ClinicalConditionsModule {}