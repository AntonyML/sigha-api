import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hogar_de_ancianos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface TestUser {
  email: string;
  password: string;
  role: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'jmeter.user1@test.local',
    password: 'JMeterTest@123',
    role: 'admin',
  },
  {
    email: 'jmeter.user2@test.local',
    password: 'JMeterTest@456',
    role: 'nurse',
  },
  {
    email: 'jmeter.user3@test.local',
    password: 'JMeterTest@789',
    role: 'director',
  },
  {
    email: 'jmeter.user4@test.local',
    password: 'JMeterTest@012',
    role: 'physiotherapist',
  },
  {
    email: 'jmeter.user5@test.local',
    password: 'JMeterTest@345',
    role: 'psychologist',
  },
];

async function createTestUsers(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Iniciando creación de usuarios de prueba para JMeter...\n');

    for (const testUser of TEST_USERS) {
      try {
        // Verificar si el usuario ya existe
        const [existingUsers] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [testUser.email]
        );

        if ((existingUsers as Array<any>).length > 0) {
          console.log(`⏭️  Usuario ${testUser.email} ya existe, saltando...`);
          continue;
        }

        // Obtener el role_id
        const [roles] = await connection.query(
          'SELECT id FROM roles WHERE name = ?',
          [testUser.role]
        );

        if ((roles as Array<any>).length === 0) {
          console.log(`❌ Rol ${testUser.role} no encontrado para ${testUser.email}`);
          continue;
        }

        const roleId = (roles as any)[0].id;

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        // Crear el usuario
        await connection.query(
          `INSERT INTO users (
            email,
            password,
            role_id,
            is_active,
            two_factor_enabled,
            two_factor_secret,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            testUser.email,
            hashedPassword,
            roleId,
            true, // is_active
            false, // two_factor_enabled - IMPORTANTE: sin 2FA
            null, // two_factor_secret
          ]
        );

        console.log(`✅ Usuario creado: ${testUser.email}`);
        console.log(`   Contraseña: ${testUser.password}`);
        console.log(`   Rol: ${testUser.role}\n`);
      } catch (error) {
        console.error(`❌ Error creando usuario ${testUser.email}:`, error);
      }
    }

    // Mostrar resumen
    console.log('📊 RESUMEN DE USUARIOS DE PRUEBA PARA JMETER:');
    console.log('═'.repeat(60));
    TEST_USERS.forEach((user) => {
      console.log(`📧 ${user.email}`);
      console.log(`🔐 ${user.password}`);
      console.log(`👤 Rol: ${user.role}`);
      console.log('');
    });

    console.log('═'.repeat(60));
    console.log(
      '\n✨ Usuarios de prueba listos para usar en JMeter (sin 2FA activado)'
    );
    console.log('💡 Tip: Actualiza users-performance-test.jmx con estos emails/passwords\n');
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

createTestUsers();
