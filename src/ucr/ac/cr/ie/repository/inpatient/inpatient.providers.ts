import { DataSource } from 'typeorm';
import { FacilityRoom, PatientBedAssignment } from '../../domain/inpatient';

export const inpatientProviders = [
    {
        provide: 'FacilityRoomRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(FacilityRoom),
        inject: ['DataSource'],
    },
    {
        provide: 'PatientBedAssignmentRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PatientBedAssignment),
        inject: ['DataSource'],
    },
];
