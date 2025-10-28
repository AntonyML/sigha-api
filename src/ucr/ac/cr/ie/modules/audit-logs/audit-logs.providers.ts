import { DataSource } from 'typeorm';
import { AuditLog } from '../../domain/audit-logs';
import { User } from '../../domain/auth/core/user.entity';

export const auditLogsProviders = [
  {
    provide: 'AUDIT_LOG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AuditLog),
    inject: ['DataSource'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DataSource'],
  },
];