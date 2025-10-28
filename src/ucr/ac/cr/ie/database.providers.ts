import { DataSource } from 'typeorm';
import { User } from './domain/auth/core/user.entity';
import { Role } from './domain/auth/core/role.entity';
import { UserSession } from './domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from './domain/auth/security/user-two-factor.entity';
import { LoginAttempt } from './domain/auth/security/login-attempt.entity';
import { PasswordResetToken } from './domain/auth/tokens/password-reset-token.entity';
import { EntranceExit } from './domain/entrances-exits/entrance-exit.entity';
import { RoleChange } from './domain/roles/role-change.entity';
import { AuditReport, DigitalRecord, OlderAdultUpdate } from './domain/audit';
import { 
    Program, 
    SubProgram, 
    OlderAdult, 
    OlderAdultFamily, 
    ClinicalHistory, 
    ClinicalCondition, 
    Vaccine, 
    ClinicalMedication, 
    ClinicalHistoryAndCondition, 
    VaccinesAndClinicalHistory, 
    OlderAdultSubprogram, 
    EmergencyContact 
} from './domain/virtual-records';
import { Notification, NotificationAttachment } from './domain/notifications';

export const databaseProviders = [
    {
        provide: 'DataSource',
        useFactory: async (): Promise<DataSource> => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                entities: [
                    User,
                    Role,
                    UserSession,
                    UserTwoFactor,
                    LoginAttempt,
                    PasswordResetToken,
                    EntranceExit,
                    RoleChange,
                    AuditReport,
                    DigitalRecord,
                    OlderAdultUpdate,
                    Program,
                    SubProgram,
                    OlderAdult,
                    OlderAdultFamily,
                    ClinicalHistory,
                    ClinicalCondition,
                    Vaccine,
                    ClinicalMedication,
                    ClinicalHistoryAndCondition,
                    VaccinesAndClinicalHistory,
                    OlderAdultSubprogram,
                    EmergencyContact,
                    Notification,
                    NotificationAttachment,
                ],
                synchronize: false,
                logging: process.env.NODE_ENV === 'development',
            });

            return dataSource.initialize();
        },
    },
];
