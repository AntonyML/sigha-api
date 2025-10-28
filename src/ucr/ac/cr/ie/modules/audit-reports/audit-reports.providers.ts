import { DataSource } from 'typeorm';
import { AuditReport } from '../../domain/audit';
import { DigitalRecord } from '../../domain/audit';
import { OlderAdultUpdate } from '../../domain/audit';
import { User } from '../../domain/auth/core/user.entity';
import { RoleChange } from '../../domain/roles/role-change.entity';
import { LoginAttempt } from '../../domain/auth/security/login-attempt.entity';

export const auditReportsProviders = [
  {
    provide: 'AUDIT_REPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AuditReport),
    inject: ['DataSource'],
  },
  {
    provide: 'DIGITAL_RECORD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DigitalRecord),
    inject: ['DataSource'],
  },
  {
    provide: 'OLDER_ADULT_UPDATE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OlderAdultUpdate),
    inject: ['DataSource'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DataSource'],
  },
  {
    provide: 'ROLE_CHANGE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleChange),
    inject: ['DataSource'],
  },
  {
    provide: 'LOGIN_ATTEMPT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(LoginAttempt),
    inject: ['DataSource'],
  },
];