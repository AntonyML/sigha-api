import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Role, RoleType } from '../src/ucr/ac/cr/ie/domain/auth/core/role.entity';
import { User } from '../src/ucr/ac/cr/ie/domain/auth/core/user.entity';
import { UserSession } from '../src/ucr/ac/cr/ie/domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../src/ucr/ac/cr/ie/domain/auth/security/user-two-factor.entity';
import { PasswordUtil } from '../src/ucr/ac/cr/ie/common/utils/password.util';

// Cargar variables de entorno
config();

/**
 * Función auxiliar para deshabilitar 2FA de un usuario específico (útil para testing)
 */
async function disable2FAForUser(email: string) {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [User, Role, UserSession, UserTwoFactor],
        synchronize: true,
    });

    try {
        await dataSource.initialize();
        
        const userRepository = dataSource.getRepository(User);
        const twoFactorRepository = dataSource.getRepository(UserTwoFactor);
        
        const user = await userRepository.findOne({ where: { uEmail: email } });
        if (!user) {
            console.log(`❌ Usuario no encontrado: ${email}`);
            return;
        }
        
        const twoFactor = await twoFactorRepository.findOne({ where: { userId: user.id } });
        if (twoFactor) {
            await twoFactorRepository.remove(twoFactor);
            console.log(`✅ 2FA deshabilitado para: ${email}`);
        } else {
            console.log(`ℹ️  El usuario ${email} no tenía 2FA habilitado`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await dataSource.destroy();
    }
}

async function createSuperUsers() {
    console.log('\n=== VERIFICANDO CONFIGURACIÓN ===');
    console.log('DB_HOST:', process.env.DB_HOST || 'undefined');
    console.log('DB_PORT:', process.env.DB_PORT || 'undefined');
    console.log('DB_USERNAME:', process.env.DB_USERNAME || 'undefined');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : 'undefined');
    console.log('DB_NAME:', process.env.DB_NAME || 'undefined');
    console.log();
    
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hogar_de_ancianos',
        entities: [User, Role, UserSession, UserTwoFactor],
        synchronize: true,
    });

    try {
        await dataSource.initialize();
        console.log('Conexión a la base de datos establecida');

        const roleRepository = dataSource.getRepository(Role);
        const userRepository = dataSource.getRepository(User);
        const twoFactorRepository = dataSource.getRepository(UserTwoFactor);

        // Crear roles del sistema
        console.log('\n=== VERIFICANDO ROLES DEL SISTEMA ===');
        const systemRoles = Object.values(RoleType);
        for (const roleName of systemRoles) {
            const existingRole = await roleRepository.findOne({ where: { rName: roleName } });
            if (!existingRole) {
                const role = new Role(0, roleName);
                await roleRepository.save(role);
                console.log(`✅ Rol creado: ${roleName}`);
            } else {
                console.log(`ℹ️  Rol ya existe: ${roleName}`);
            }
        }

        console.log('\n=== VERIFICANDO USUARIOS ADMINISTRADORES ===');
        
        // Crear usuario super admin
        const superAdminRole = await roleRepository.findOne({ where: { rName: RoleType.SUPER_ADMIN } });
        if (superAdminRole) {
            const existingSuperAdmin = await userRepository.findOne({
                where: { uEmail: 'superadmin@hogarancianos.com' }
            });

            if (!existingSuperAdmin) {
                const hashedPassword = await PasswordUtil.hash('SuperAdmin123!');
                const superAdmin = new User(
                    0,
                    'SUPER-ADMIN-001',
                    'Super',
                    'Administrator',
                    'superadmin@hogarancianos.com',
                    hashedPassword,
                    superAdminRole.id,
                    undefined,
                    true,
                    true
                );

                await userRepository.save(superAdmin);
                console.log('✅ Super administrador creado:');
                console.log('   📧 Email: superadmin@hogarancianos.com');
                console.log('   🔑 Password: SuperAdmin123!');
                console.log('   🔒 2FA: DESHABILITADO (se activa manualmente desde la app)');
                console.log('   ⚠️  IMPORTANTE: Cambiar la contraseña después del primer login!');
            } else {
                console.log('ℹ️  Super administrador ya existe: superadmin@hogarancianos.com');
                
                // Verificar estado del 2FA
                const twoFactor = await twoFactorRepository.findOne({
                    where: { userId: existingSuperAdmin.id }
                });
                
                if (twoFactor && twoFactor.tfaEnabled) {
                    console.log('   🔐 2FA: HABILITADO - Para testing, deshabilitar desde la app o base de datos');
                } else {
                    console.log('   🔒 2FA: DESHABILITADO - Listo para login directo');
                }
            }
        }

        // Crear usuario admin
        const adminRole = await roleRepository.findOne({ where: { rName: RoleType.ADMIN } });
        if (adminRole) {
            const existingAdmin = await userRepository.findOne({
                where: { uEmail: 'admin@hogarancianos.com' }
            });

            if (!existingAdmin) {
                const hashedPassword = await PasswordUtil.hash('Admin123!');
                const admin = new User(
                    0,
                    'ADMIN-001',
                    'Administrador',
                    'Sistema',
                    'admin@hogarancianos.com',
                    hashedPassword,
                    adminRole.id,
                    undefined,
                    true,
                    true
                );

                await userRepository.save(admin);
                console.log('✅ Administrador creado:');
                console.log('   📧 Email: admin@hogarancianos.com');
                console.log('   🔑 Password: Admin123!');
                console.log('   🔒 2FA: DESHABILITADO (se activa manualmente desde la app)');
            } else {
                console.log('ℹ️  Administrador ya existe: admin@hogarancianos.com');
                
                // Verificar estado del 2FA
                const twoFactor = await twoFactorRepository.findOne({
                    where: { userId: existingAdmin.id }
                });
                
                if (twoFactor && twoFactor.tfaEnabled) {
                    console.log('   🔐 2FA: HABILITADO - Para testing, deshabilitar desde la app o base de datos');
                } else {
                    console.log('   🔒 2FA: DESHABILITADO - Listo para login directo');
                }
            }
        }

        console.log('\n🎉 Inicialización completada exitosamente');
        console.log('\n📝 NOTAS IMPORTANTES:');
        console.log('   • El 2FA está DESHABILITADO por defecto para nuevos usuarios');
        console.log('   • Los usuarios pueden habilitar 2FA desde la aplicación usando /auth/setup-2fa');
        console.log('   • Para testing, usa login directo sin twoFactorCode');
        console.log('   • Si un usuario tiene 2FA habilitado, el login devuelve requiresTwoFactor=true');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    } finally {
        await dataSource.destroy();
    }
}

// Script ejecutable desde línea de comandos
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === 'disable-2fa') {
        const email = args[1] || 'superadmin@hogarancianos.com';
        console.log(`🔧 Deshabilitando 2FA para: ${email}`);
        disable2FAForUser(email);
    } else {
        console.log('🚀 Iniciando creación/verificación de usuarios administradores...');
        createSuperUsers();
    }
}

export default createSuperUsers;
export { disable2FAForUser };