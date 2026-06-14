import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Role, RoleType } from '../src/ucr/ac/cr/ie/domain/auth/core/role.entity';
import { User } from '../src/ucr/ac/cr/ie/domain/auth/core/user.entity';
import { UserRole } from '../src/ucr/ac/cr/ie/domain/auth/core/user-role.entity';
import { UserSession } from '../src/ucr/ac/cr/ie/domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../src/ucr/ac/cr/ie/domain/auth/security/user-two-factor.entity';
import { PasswordUtil } from '../src/ucr/ac/cr/ie/common/utils/password.util';
import { buildScriptDataSourceOptions } from './script-data-source';

config();

async function disable2FAForUser(email: string) {
    const dataSource = new DataSource(
        buildScriptDataSourceOptions({ entities: [User, Role, UserRole, UserSession, UserTwoFactor] }),
    );

    try {
        await dataSource.initialize();

        const userRepository = dataSource.getRepository(User);
        const twoFactorRepository = dataSource.getRepository(UserTwoFactor);

        const user = await userRepository.findOne({ where: { uEmail: email } });
        if (!user) {
            console.log(`[ERROR] Usuario no encontrado: ${email}`);
            return;
        }

        const twoFactor = await twoFactorRepository.findOne({ where: { userId: user.id } });
        if (twoFactor) {
            await twoFactorRepository.remove(twoFactor);
            console.log(`[OK] 2FA deshabilitado para: ${email}`);
        } else {
            console.log(`[INFO] El usuario ${email} no tenía 2FA habilitado`);
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

    const dataSource = new DataSource(
        buildScriptDataSourceOptions({ entities: [User, Role, UserRole, UserSession, UserTwoFactor] }),
    );

    try {
        await dataSource.initialize();
        console.log('Conexión a la base de datos establecida');

        const roleRepository = dataSource.getRepository(Role);
        const userRepository = dataSource.getRepository(User);
        const userRoleRepository = dataSource.getRepository(UserRole);
        const twoFactorRepository = dataSource.getRepository(UserTwoFactor);

        await createSystemRoles(roleRepository);
        await createSuperAdminsFromEnv(userRepository, twoFactorRepository, userRoleRepository, roleRepository);

        console.log('\n[SUCCESS] Inicialización completada exitosamente');
        console.log('\n[NOTE] NOTAS IMPORTANTES:');
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

async function createSystemRoles(roleRepository: any) {
    console.log('\n=== VERIFICANDO ROLES DEL SISTEMA ===');
    const systemRoles = Object.values(RoleType);
    for (const roleName of systemRoles) {
        const existingRole = await roleRepository.findOne({ where: { rName: roleName } });
        if (!existingRole) {
            const role = new Role(0, roleName);
            await roleRepository.save(role);
            console.log(`[OK] Rol creado: ${roleName}`);
        } else {
            console.log(`Rol ya existe: ${roleName}`);
        }
    }
}

async function createSuperAdminsFromEnv(userRepository: any, twoFactorRepository: any, userRoleRepository: any, roleRepository: any) {
    console.log('\n=== VERIFICANDO USUARIOS SUPER ADMINISTRADORES ===');

    const superAdminRole = await roleRepository.findOne({ where: { rName: RoleType.SUPER_ADMIN } });
    if (!superAdminRole) return;

    const superAdmins = getSuperAdminsFromEnv();

    for (const adminData of superAdmins) {
        await createOrVerifyUser(adminData, userRepository, twoFactorRepository, userRoleRepository, superAdminRole.id);
    }
}

function getSuperAdminsFromEnv() {
    return [
        {
            code: process.env.SUPER_ADMIN_1_CODE || '604700548',
            firstName: process.env.SUPER_ADMIN_1_FIRST_NAME || 'Antony',
            lastName: process.env.SUPER_ADMIN_1_LAST_NAME || 'Monge',
            secondLastName: process.env.SUPER_ADMIN_1_SECOND_LAST_NAME || 'Lopez',
            email: process.env.SUPER_ADMIN_1_EMAIL || 'antony.mongelopez@ucr.ac.cr',
            employeeCode: process.env.SUPER_ADMIN_1_EMPLOYEE_CODE || 'C36589',
            password: process.env.SUPER_ADMIN_1_PASSWORD || 'tonyml123!'
        },
        {
            code: process.env.SUPER_ADMIN_2_CODE || 'C35380',
            firstName: process.env.SUPER_ADMIN_2_FIRST_NAME || 'Luis',
            lastName: process.env.SUPER_ADMIN_2_LAST_NAME || 'Rivera',
            secondLastName: process.env.SUPER_ADMIN_2_SECOND_LAST_NAME || 'Lopez',
            email: process.env.SUPER_ADMIN_2_EMAIL || 'luis.riveralopez@ucr.ac.cr',
            employeeCode: process.env.SUPER_ADMIN_2_EMPLOYEE_CODE || 'C35380',
            password: process.env.SUPER_ADMIN_2_PASSWORD || 'luisrl123!'
        },
        {
            code: process.env.SUPER_ADMIN_3_CODE || 'JMF001',
            firstName: process.env.SUPER_ADMIN_3_FIRST_NAME || 'Jonathan',
            lastName: process.env.SUPER_ADMIN_3_LAST_NAME || 'Moreno',
            secondLastName: process.env.SUPER_ADMIN_3_SECOND_LAST_NAME || 'Fajardo',
            email: process.env.SUPER_ADMIN_3_EMAIL || 'jonathanfajardo406@gmail.com',
            employeeCode: process.env.SUPER_ADMIN_3_EMPLOYEE_CODE || 'JMF001',
            password: process.env.SUPER_ADMIN_3_PASSWORD || 'jonathanmf123!'
        }
    ];
}

async function createOrVerifyUser(adminData: any, userRepository: any, twoFactorRepository: any, userRoleRepository: any, roleId: number) {
    const existingUser = await userRepository.findOne({ where: { uEmail: adminData.email } });

    if (!existingUser) {
        const hashedPassword = await PasswordUtil.hash(adminData.password);
        const superAdmin = new User(
            0,
            adminData.employeeCode,
            adminData.firstName,
            adminData.lastName,
            adminData.email,
            hashedPassword,
            roleId,
            adminData.secondLastName,
            true,
            true
        );

        const savedUser = await userRepository.save(superAdmin);

        // Seed user_roles: user_roles is the authoritative role source.
        const existingAssignment = await userRoleRepository.findOne({
            where: { userId: savedUser.id, roleId },
        });
        if (!existingAssignment) {
            const ur = userRoleRepository.create({
                userId: savedUser.id,
                roleId,
                isPrimary: true,
                assignedBy: null,
            });
            await userRoleRepository.save(ur);
        }

        console.log(`[OK] Super administrador creado:`);
        console.log(`   [EMAIL] Email: ${adminData.email}`);
        console.log(`   [PASSWORD] Password: ${adminData.password}`);
        console.log(`   [LOCK] 2FA: DESHABILITADO (se activa manualmente desde la app)`);
        console.log(`   [WARNING] IMPORTANTE: Cambiar la contraseña después del primer login!`);
    } else {
        console.log(`Super administrador ya existe: ${adminData.email}`);

        // Ensure user_roles entry exists for already-created super admins.
        const existingAssignment = await userRoleRepository.findOne({
            where: { userId: existingUser.id, roleId },
        });
        if (!existingAssignment) {
            const ur = userRoleRepository.create({
                userId: existingUser.id,
                roleId,
                isPrimary: true,
                assignedBy: null,
            });
            await userRoleRepository.save(ur);
            console.log(`   [OK] user_roles entry creado para usuario existente`);
        }

        const twoFactor = await twoFactorRepository.findOne({ where: { userId: existingUser.id } });

        if (twoFactor && twoFactor.tfaEnabled) {
            console.log('   [SECURE] 2FA: HABILITADO - Para testing, deshabilitar desde la app o base de datos');
        } else {
            console.log('   [LOCK] 2FA: DESHABILITADO - Listo para login directo');
        }
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length > 0 && args[0] === 'disable-2fa') {
        const email = args[1] || 'antony.mongelopez@ucr.ac.cr';
        console.log(`[TOOL] Deshabilitando 2FA para: ${email}`);
        disable2FAForUser(email);
    } else {
        console.log('[START] Iniciando creación/verificación de usuarios administradores...');
        createSuperUsers();
    }
}

export default createSuperUsers;
export { disable2FAForUser };