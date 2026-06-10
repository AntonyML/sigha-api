import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const DEFAULT_DB = 'hogar_de_ancianos';
const DEFAULT_SCHEMA = 'public';

async function checkDatabaseSchema(): Promise<void> {
  console.log('\n=== VERIFICACIÓN DE ESQUEMA DE BASE DE DATOS ===');

  const useUrl = Boolean(process.env.DATABASE_URL);
  const ssl =
    process.env.DB_SSL === 'true' ||
    (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require');

  const dataSource = new DataSource(
    useUrl
      ? {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [],
          synchronize: false,
          logging: false,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        }
      : {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || DEFAULT_DB,
          entities: [],
          synchronize: false,
          logging: false,
          ssl: ssl ? { rejectUnauthorized: false } : false,
        },
  );

  try {
    await dataSource.initialize();
    console.log('[SUCCESS] Conexión establecida exitosamente');

    const schema = (process.env.DB_SCHEMA || DEFAULT_SCHEMA) as string;

    // Tabla users
    const usersCount: Array<{ count: string }> = await dataSource.query(
      `SELECT COUNT(*)::int AS count
         FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'users'`,
      [schema],
    );
    const usersExists = Number(usersCount[0]?.count ?? 0) > 0;

    console.log('\n=== ESTADO DE TABLAS ===');
    if (usersExists) {
      console.log('✅ Tabla users: EXISTE');

      // Estructura (information_schema.columns en lugar de DESCRIBE).
      const usersStructure: Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }> = await dataSource.query(
        `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = 'users'
          ORDER BY ordinal_position`,
        [schema],
      );
      console.log('\n📋 Estructura de tabla users:');
      usersStructure.forEach((column) => {
        const notNull = column.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
        console.log(`   • ${column.column_name} (${column.data_type}) ${notNull}`);
      });

      // Índices (pg_indexes en lugar de SHOW INDEX).
      const usersIndexes: Array<{ indexname: string; indexdef: string }> = await dataSource.query(
        `SELECT indexname, indexdef
           FROM pg_indexes
          WHERE schemaname = $1 AND tablename = 'users'`,
        [schema],
      );
      console.log('\n🔍 Índices en tabla users:');
      usersIndexes.forEach((idx) => {
        console.log(`   • ${idx.indexname}: ${idx.indexdef}`);
      });

      const userCount: Array<{ count: string }> = await dataSource.query(
        'SELECT COUNT(*)::int AS count FROM users',
      );
      console.log(`\n👥 Total de usuarios: ${userCount[0]?.count ?? 0}`);
    } else {
      console.log('❌ Tabla users: NO EXISTE');
    }

    // Tabla roles
    const rolesCount: Array<{ count: string }> = await dataSource.query(
      `SELECT COUNT(*)::int AS count
         FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'roles'`,
      [schema],
    );
    const rolesExists = Number(rolesCount[0]?.count ?? 0) > 0;
    if (rolesExists) {
      console.log('✅ Tabla roles: EXISTE');
      const roleCount: Array<{ count: string }> = await dataSource.query(
        'SELECT COUNT(*)::int AS count FROM roles',
      );
      console.log(`   📊 Total de roles: ${roleCount[0]?.count ?? 0}`);
    } else {
      console.log('❌ Tabla roles: NO EXISTE');
    }

    // Listar todas las tablas
    const allTables: Array<{ table_name: string }> = await dataSource.query(
      `SELECT table_name
         FROM information_schema.tables
        WHERE table_schema = $1
        ORDER BY table_name`,
      [schema],
    );
    console.log('\n📋 TODAS LAS TABLAS:');
    if (allTables.length > 0) {
      allTables.forEach((table) => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log('   ⚠️  No se encontraron tablas en el esquema');
    }
  } catch (error) {
    console.error('[ERROR] Error durante la verificación:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  console.log('[START] Iniciando verificación de esquema...');
  checkDatabaseSchema().catch((error) => {
    console.error('Verificación fallida:', error);
    process.exit(1);
  });
}

export default checkDatabaseSchema;
