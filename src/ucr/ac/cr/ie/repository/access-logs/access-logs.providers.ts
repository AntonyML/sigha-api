import { DataSource } from 'typeorm';
import { OlderAdult } from '../../domain/virtual-records';
import { AccessLog } from '../../domain/access-logs';

export const accessLogsProviders = [
  {
    provide: 'AccessLogRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AccessLog),
    inject: ['DataSource'],
  },
  {
    provide: 'AccessLogOlderAdultRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OlderAdult),
    inject: ['DataSource'],
  },
];
