import { DataSource } from 'typeorm';
import { EntranceExit } from '../../domain/entrances-exits/entrance-exit.entity';

export const entranceExitProviders = [
    {
        provide: 'EntranceExitRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(EntranceExit),
        inject: ['DataSource'],
    },
];