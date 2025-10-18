import { DataSource } from 'typeorm';
import { Role, RoleType } from '../src/ucr/ac/cr/ie/domain/auth/core/role.entity';
import { User } from '../src/ucr/ac/cr/ie/domain/auth/core/user.entity';
import { UserSession } from '../src/ucr/ac/cr/ie/domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../src/ucr/ac/cr/ie/domain/auth/security/user-two-factor.entity';
import { PasswordUtil } from '../src/ucr/ac/cr/ie/common/utils/password.util';

async function createSuperUsers() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST ,
        port: parseInt(process.env.DB_PORT) ,
        username: process.env.DB_USERNAME ,
        password: process.env.DB_PASSWORD ,
        database: process.env.DB_NAME ,
        entities: [User, Role, UserSession, UserTwoFactor],
        synchronize: true,
    });

    try {
        await dataSource.initialize();
        console.log('Conexión a la base de datos establecida');

        const roleRepository = dataSource.getRepository(Role);
        const userRepository = dataSource.getRepository(User);

        // Crear roles del sistema
        const systemRoles = Object.values(RoleType);
        for (const roleName of systemRoles) {
            const existingRole = await roleRepository.findOne({ where: { rName: roleName } });
            if (!existingRole) {
                const role = new Role(0, roleName);
                await roleRepository.save(role);
                console.log(`Rol creado: ${roleName}`);
            }
        }

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
                console.log('Super administrador creado:');
                console.log('Email: superadmin@hogarancianos.com');
                console.log('Password: SuperAdmin123!');
                console.log('¡IMPORTANTE: Cambiar la contraseña después del primer login!');
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
                console.log('Administrador creado:');
                console.log('Email: admin@hogarancianos.com');
                console.log('Password: Admin123!');
            }
        }

        console.log('Inicialización completada exitosamente');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    } finally {
        await dataSource.destroy();
    }
}

export default createSuperUsers;