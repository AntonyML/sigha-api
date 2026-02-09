import { DataSource } from 'typeorm';
import {
    SpecializedArea,
    SpecializedAppointment,
    NursingRecord,
    PhysiotherapySession,
    PsychologySession,
    MedicalRecord,
    SocialWorkReport
} from '../../domain/nursing';

export const nursingProviders = [
    {
        provide: 'SpecializedAreaRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SpecializedArea),
        inject: ['DataSource'],
    },
    {
        provide: 'SpecializedAppointmentRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SpecializedAppointment),
        inject: ['DataSource'],
    },
    {
        provide: 'NursingRecordRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(NursingRecord),
        inject: ['DataSource'],
    },
    {
        provide: 'PhysiotherapySessionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PhysiotherapySession),
        inject: ['DataSource'],
    },
    {
        provide: 'PsychologySessionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PsychologySession),
        inject: ['DataSource'],
    },
    {
        provide: 'MedicalRecordRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(MedicalRecord),
        inject: ['DataSource'],
    },
    {
        provide: 'SocialWorkReportRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(SocialWorkReport),
        inject: ['DataSource'],
    },
];
