import { DataSource } from 'typeorm';
import { User } from './domain/auth/core/user.entity';
import { Role } from './domain/auth/core/role.entity';
import { UserSession } from './domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from './domain/auth/security/user-two-factor.entity';

export const databaseProviders = [
    {
        provide: 'DataSource',
        useFactory: async (): Promise<DataSource> => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'hogar_de_ancianos',
                entities: [
                    User,
                    Role,
                    UserSession,
                    UserTwoFactor,
                ],
                synchronize: process.env.NODE_ENV === 'development',
                logging: process.env.NODE_ENV === 'development',
            });

            return dataSource.initialize();
        },
    },
];