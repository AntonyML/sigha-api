import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hogar_de_ancianos',
    synchronize: false,
    logging: true,
});

async function disable2FAForUser(email: string) {
    try {
        await dataSource.initialize();
        console.log(`\n=== DESHABILITANDO 2FA PARA ${email} ===`);

        // Buscar el usuario
        const userQuery = `
            SELECT id, u_email, u_name 
            FROM users 
            WHERE u_email = ? AND u_is_active = 1
        `;
        
        const users = await dataSource.query(userQuery, [email]);
        
        if (!users || users.length === 0) {
            console.log('❌ Usuario no encontrado o inactivo');
            return;
        }

        const user = users[0];
        console.log(`✅ Usuario encontrado: ${user.u_name} (ID: ${user.id})`);

        // Verificar si tiene 2FA habilitado
        const twoFactorQuery = `
            SELECT id, tfa_enabled 
            FROM user_two_factor 
            WHERE user_id = ?
        `;
        
        const twoFactorRecords = await dataSource.query(twoFactorQuery, [user.id]);
        
        if (!twoFactorRecords || twoFactorRecords.length === 0) {
            console.log('ℹ️  Usuario no tiene configuración 2FA');
            return;
        }

        const twoFactor = twoFactorRecords[0];
        
        if (!twoFactor.tfa_enabled) {
            console.log('ℹ️  2FA ya está deshabilitado para este usuario');
            return;
        }

        // Deshabilitar 2FA
        const disableQuery = `
            DELETE FROM user_two_factor 
            WHERE user_id = ?
        `;
        
        await dataSource.query(disableQuery, [user.id]);
        
        console.log('🎉 2FA deshabilitado exitosamente');
        console.log('✅ Ahora puedes hacer login normal sin 2FA');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

// Obtener email de argumentos de línea de comandos
const email = process.argv.find(arg => arg.includes('@')) || 'superadmin@hogarancianos.com';

console.log('🚀 Iniciando script para deshabilitar 2FA...');
disable2FAForUser(email).then(() => {
    console.log('📝 Script completado');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});