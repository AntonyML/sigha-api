import { DataSource } from 'typeorm';
import {
    Program,
    SubProgram,
    OlderAdult,
    OlderAdultFamily,
    ClinicalHistory,
    ClinicalCondition,
    Vaccine,
    ClinicalMedication,
    ClinicalHistoryAndCondition,
    VaccinesAndClinicalHistory,
    OlderAdultSubprogram,
    EmergencyContact
} from '../../domain/virtual-records';

export const virtualRecordsProviders = [
    {
        provide: 'ProgramRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Program),
        inject: ['DataSource'],
    },
    {
        provide: 'SubProgramRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SubProgram),
        inject: ['DataSource'],
    },
    {
        provide: 'OlderAdultRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OlderAdult),
        inject: ['DataSource'],
    },
    {
        provide: 'OlderAdultFamilyRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OlderAdultFamily),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalHistoryRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalHistory),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalConditionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalCondition),
        inject: ['DataSource'],
    },
    {
        provide: 'VaccineRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Vaccine),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalMedicationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalMedication),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalHistoryAndConditionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalHistoryAndCondition),
        inject: ['DataSource'],
    },
    {
        provide: 'VaccinesAndClinicalHistoryRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(VaccinesAndClinicalHistory),
        inject: ['DataSource'],
    },
    {
        provide: 'OlderAdultSubprogramRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(OlderAdultSubprogram),
        inject: ['DataSource'],
    },
    {
        provide: 'EmergencyContactRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(EmergencyContact),
        inject: ['DataSource'],
    },
];