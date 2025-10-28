import { DataSource } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { UserSession } from '../../domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../../domain/auth/security/user-two-factor.entity';
import { PasswordResetToken } from '../../domain/auth/tokens/password-reset-token.entity';
import { RoleChange } from '../../domain/roles/role-change.entity';

export const authProviders = [
    {
        provide: 'UserRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: ['DataSource'],
    },
    {
        provide: 'RoleRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
        inject: ['DataSource'],
    },
    {
        provide: 'UserSessionRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UserSession),
        inject: ['DataSource'],
    },
    {
        provide: 'UserTwoFactorRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(UserTwoFactor),
        inject: ['DataSource'],
    },
    {
        provide: 'PasswordResetTokenRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(PasswordResetToken),
        inject: ['DataSource'],
    },
    {
        provide: 'RoleChangeRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(RoleChange),
        inject: ['DataSource'],
    },
];