import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './domain/auth/core/user.entity';
import { Role } from './domain/auth/core/role.entity';
import { UserRole } from './domain/auth/core/user-role.entity';
import { UserSession } from './domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from './domain/auth/security/user-two-factor.entity';
import { LoginAttempt } from './domain/auth/security/login-attempt.entity';
import { EmailVerificationToken } from './domain/auth/tokens/email-verification-token.entity';
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
import {
    SpecializedArea,
    SpecializedAppointment,
    NursingRecord,
    PhysiotherapySession,
    PsychologySession,
    SocialWorkReport,
    MedicalRecord,
} from './domain/nursing';
import { Permission, RolePermission } from './domain/permissions';

/**
 * Build the TypeORM DataSource options from environment variables.
 *
 * Two connection modes are supported (in priority order):
 *   1. `DATABASE_URL` — full Postgres URL. Preferred for Supabase / managed DBs.
 *      If it contains `sslmode=require` or `ssl=true` (or DB_SSL=true is set),
 *      SSL is enabled with `rejectUnauthorized: false` (Supabase pooler certs).
 *   2. Discrete `DB_*` vars — host, port, username, password, database.
 *      Used as a fallback (legacy / local docker).
 */
function buildDataSourceOptions(): DataSourceOptions {
    const entities = [
        User,
        Role,
        UserRole,
        UserSession,
        UserTwoFactor,
        LoginAttempt,
        EmailVerificationToken,
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
        SpecializedArea,
        SpecializedAppointment,
        NursingRecord,
        PhysiotherapySession,
        PsychologySession,
        SocialWorkReport,
        MedicalRecord,
        Permission,
        RolePermission,
    ];

    const sslEnabled = 
            process.env.DB_SSL === 'true' ||
            (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require') ||
            (process.env.DATABASE_URL || '').toLowerCase().includes('ssl=true');

        // TypeORM logging configuration
        // Only log SQL errors by default, not all queries
        // Set to true ONLY for debugging specific query issues
        const typeOrmLogging = process.env.TYPEORM_LOGGING === 'true' || false;

        const baseOptions: DataSourceOptions = {
            type: 'postgres',
            entities,
            synchronize: false,
            logging: typeOrmLogging,
            logger: 'advanced-console', // Uses console but with levels
        };

    if (process.env.DATABASE_URL) {
        return {
            ...baseOptions,
            url: process.env.DATABASE_URL,
            ssl: sslEnabled ? { rejectUnauthorized: false } : false,
            extra: sslEnabled ? { ssl: { rejectUnauthorized: false } } : undefined,
        };
    }

    return {
        ...baseOptions,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hogar_de_ancianos',
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    };
}

export const databaseProviders = [
    {
        provide: 'DataSource',
        useFactory: async (): Promise<DataSource> => {
            const dataSource = new DataSource(buildDataSourceOptions());
            return dataSource.initialize();
        },
    },
];

// Exposed for scripts (create-super-users, reset-database, check-schema).
export const dataSourceOptions = buildDataSourceOptions();
