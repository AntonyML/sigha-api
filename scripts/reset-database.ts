import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/ucr/ac/cr/ie/domain/auth/core/user.entity';
import { Role } from '../src/ucr/ac/cr/ie/domain/auth/core/role.entity';
import { UserSession } from '../src/ucr/ac/cr/ie/domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../src/ucr/ac/cr/ie/domain/auth/security/user-two-factor.entity';
import { LoginAttempt } from '../src/ucr/ac/cr/ie/domain/auth/security/login-attempt.entity';
import { PasswordResetToken } from '../src/ucr/ac/cr/ie/domain/auth/tokens/password-reset-token.entity';
import { EntranceExit } from '../src/ucr/ac/cr/ie/domain/entrances-exits/entrance-exit.entity';
import { RoleChange } from '../src/ucr/ac/cr/ie/domain/roles/role-change.entity';
import { AuditReport, DigitalRecord, OlderAdultUpdate } from '../src/ucr/ac/cr/ie/domain/audit';
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
} from '../src/ucr/ac/cr/ie/domain/virtual-records';
import { Notification, NotificationAttachment } from '../src/ucr/ac/cr/ie/domain/notifications';

config();

async function resetDatabase() {
    console.log('\n=== RESET DE BASE DE DATOS ===');
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos');
    console.log('DB_HOST:', process.env.DB_HOST || 'undefined');
    console.log('DB_NAME:', process.env.DB_NAME || 'undefined');
    console.log();

    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hogar_de_ancianos',
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
        synchronize: true,
        dropSchema: true,
        logging: true,
    });

    try {
        console.log('[INFO] Conectando a la base de datos...');
        await dataSource.initialize();
        
        console.log('[SUCCESS] ✅ Base de datos reiniciada exitosamente');
        console.log('[INFO] El esquema ha sido recreado con todas las entidades');
        console.log('[NEXT] Ahora puedes ejecutar el servidor normalmente');
        console.log('[NEXT] Los usuarios super administradores se crearán automáticamente al iniciar');
        
    } catch (error) {
        console.error('[ERROR] Error durante el reset:', error);
        throw error;
    } finally {
        await dataSource.destroy();
    }
}

if (require.main === module) {
    console.log('[START] Iniciando reset de base de datos...');
    resetDatabase().catch((error) => {
        console.error('Reset fallido:', error);
        process.exit(1);
    });
}

export default resetDatabase;