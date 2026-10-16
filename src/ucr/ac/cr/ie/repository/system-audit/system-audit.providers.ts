import { DataSource } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { SysAuditLog } from '../../domain/system-audit';

export const systemAuditProviders = [
  {
    provide: 'SysAuditLogRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SysAuditLog),
    inject: ['DataSource'],
  },
  {
    provide: 'SystemAuditUserRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DataSource'],
  },
];
