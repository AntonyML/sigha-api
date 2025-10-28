import { DataSource } from 'typeorm';
import { SecurityEvent } from '../../domain/security-audit';
import { User } from '../../domain/auth/core/user.entity';

export const securityAuditProviders = [
  {
    provide: 'SECURITY_EVENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(SecurityEvent),
    inject: ['DataSource'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DataSource'],
  },
];