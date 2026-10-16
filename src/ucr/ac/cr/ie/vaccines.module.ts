import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VaccinesController } from './controller/vaccines';
import { VaccinesService } from './services/vaccines/vaccines.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';
import { PatientVaccination } from './domain/vaccines';

export const vaccineProviders = [
    {
        provide: 'PatientVaccinationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PatientVaccination),
        inject: ['DataSource'],
    },
];

@Module({
    imports: [DatabaseModule],
    controllers: [VaccinesController],
    providers: [
        VaccinesService,
        ...vaccineProviders,
        ...virtualRecordsProviders.filter(provider => 
            provider.provide === 'VaccineRepository' ||
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [VaccinesService],
})
export class VaccinesModule {}