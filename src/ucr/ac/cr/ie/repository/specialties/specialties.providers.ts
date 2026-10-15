import { DataSource } from 'typeorm';
import {
    PhysiotherapyEvaluation,
    PsychologyEvaluation,
    SocialWorkEvaluation
} from '../../domain/specialties';
import { ClinicalEncounter, ClinicalScaleEvaluation } from '../../domain/encounters';

export const specialtiesProviders = [
    {
        provide: 'ClinicalEncounterRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalEncounter),
        inject: ['DataSource'],
    },
    {
        provide: 'ClinicalScaleEvaluationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ClinicalScaleEvaluation),
        inject: ['DataSource'],
    },
    {
        provide: 'PhysiotherapyEvaluationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PhysiotherapyEvaluation),
        inject: ['DataSource'],
    },
    {
        provide: 'PsychologyEvaluationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PsychologyEvaluation),
        inject: ['DataSource'],
    },
    {
        provide: 'SocialWorkEvaluationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SocialWorkEvaluation),
        inject: ['DataSource'],
    },
];
