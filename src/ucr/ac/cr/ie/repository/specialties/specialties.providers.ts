import { DataSource } from 'typeorm';
import {
    PhysiotherapyEvaluation,
    PsychologyEvaluation,
    SocialWorkEvaluation
} from '../../domain/specialties';

export const specialtiesProviders = [
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
