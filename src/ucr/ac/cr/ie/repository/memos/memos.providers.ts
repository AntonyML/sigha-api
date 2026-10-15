import { DataSource } from 'typeorm';
import { ResidentMemo, ResidentMemoAcknowledgment } from '../../domain/memos';

export const memosProviders = [
    {
        provide: 'ResidentMemoRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ResidentMemo),
        inject: ['DataSource'],
    },
    {
        provide: 'ResidentMemoAcknowledgmentRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(ResidentMemoAcknowledgment),
        inject: ['DataSource'],
    },
];
