import { DataSource } from 'typeorm';
import { PatientLifestyleAssessment } from '../../domain/lifestyle';

export const lifestyleProviders = [
    {
        provide: 'PatientLifestyleAssessmentRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PatientLifestyleAssessment),
        inject: ['DataSource'],
    },
];
