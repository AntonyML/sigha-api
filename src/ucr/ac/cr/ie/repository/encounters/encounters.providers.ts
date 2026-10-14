import { DataSource } from 'typeorm';
import {
    ClinicalEncounter,
    ClinicalVitalSigns,
    NursingRound,
    ClinicalNoteAddendum
} from '../../domain/encounters';

export const encountersProviders = [
    {
        provide: 'ClinicalEncounterRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalEncounter),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalVitalSignsRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalVitalSigns),
        inject: ['DataSource'],
    },
    {
        provide: 'NursingRoundRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(NursingRound),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalNoteAddendumRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalNoteAddendum),
        inject: ['DataSource'],
    },
];
