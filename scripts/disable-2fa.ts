import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { buildScriptDataSourceOptions } from './script-data-source';

// Cargar variables de entorno
config();

const dataSource = new DataSource(buildScriptDataSourceOptions({ logging: true }));

async function disable2FAForUser(email: string) {
    try {
        await dataSource.initialize();
        console.log(`\n=== DESHABILITANDO 2FA PARA ${email} ===`);

        // Buscar el usuario (Postgres: $1, $2 placeholders).
        const userQuery = `
            SELECT id, u_email, u_name
            FROM users
            WHERE u_email = $1 AND u_is_active = TRUE
        `;

        const users = await dataSource.query(userQuery, [email]);

        if (!users || users.length === 0) {
            console.log('[ERROR] Usuario no encontrado o inactivo');
            return;
        }

        const user = users[0];
        console.log(`[OK] Usuario encontrado: ${user.u_name} (ID: ${user.id})`);

        // Verificar si tiene 2FA habilitado
        const twoFactorQuery = `
            SELECT id, tfa_enabled
            FROM user_two_factor
            WHERE user_id = $1
        `;

        const twoFactorRecords = await dataSource.query(twoFactorQuery, [user.id]);

        if (!twoFactorRecords || twoFactorRecords.length === 0) {
            console.log('[INFO] Usuario no tiene configuración 2FA');
            return;
        }

        const twoFactor = twoFactorRecords[0];

        if (!twoFactor.tfa_enabled) {
            console.log('[INFO] 2FA ya está deshabilitado para este usuario');
            return;
        }

        // Deshabilitar 2FA
        const disableQuery = `
            DELETE FROM user_two_factor
            WHERE user_id = $1
        `;

        await dataSource.query(disableQuery, [user.id]);
        
        console.log('[SUCCESS] 2FA deshabilitado exitosamente');
        console.log('[OK] Ahora puedes hacer login normal sin 2FA');

    } catch (error) {
        console.error('[ERROR] Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

// Obtener email de argumentos de línea de comandos
const email = process.argv.find(arg => arg.includes('@')) || 'superadmin@hogarancianos.com';

console.log('[START] Iniciando script para deshabilitar 2FA...');
disable2FAForUser(email).then(() => {
    console.log('[NOTE] Script completado');
    process.exit(0);
}).catch(error => {
    console.error('[FATAL] Error fatal:', error);
    process.exit(1);
});