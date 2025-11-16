import { DataSource } from 'typeorm';
import {
    SpecializedArea,
    SpecializedAppointment,
    NursingRecord
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
];
