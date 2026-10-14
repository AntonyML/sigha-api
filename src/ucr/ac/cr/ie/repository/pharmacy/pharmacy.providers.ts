import { DataSource } from 'typeorm';
import {
    MedicationCatalog,
    MedicationPrescription,
    MedicationAdministration,
} from '../../domain/pharmacy';

export const pharmacyProviders = [
    {
        provide: 'MedicationCatalogRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(MedicationCatalog),
        inject: ['DataSource'],
    },
    {
        provide: 'MedicationPrescriptionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(MedicationPrescription),
        inject: ['DataSource'],
    },
    {
        provide: 'MedicationAdministrationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(MedicationAdministration),
        inject: ['DataSource'],
    },
];
