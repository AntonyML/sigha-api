import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

async function checkDatabaseSchema() {
    console.log('\n=== VERIFICACIÓN DE ESQUEMA DE BASE DE DATOS ===');
    
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hogar_de_ancianos',
        entities: [],
        synchronize: false,
        logging: false,
    });

    try {
        await dataSource.initialize();
        console.log('[SUCCESS] Conexión establecida exitosamente');

        // Verificar si la tabla users existe
        const [usersTableExists] = await dataSource.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = 'users'
        `, [process.env.DB_NAME || 'hogar_de_ancianos']);

        console.log('\n=== ESTADO DE TABLAS ===');
        if (usersTableExists.count > 0) {
            console.log('✅ Tabla users: EXISTE');
            
            // Mostrar estructura de la tabla users
            const usersStructure = await dataSource.query('DESCRIBE users');
            console.log('\n📋 Estructura de tabla users:');
            usersStructure.forEach((column: any) => {
                console.log(`   • ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key || ''}`);
            });

            // Mostrar índices de la tabla users
            const usersIndexes = await dataSource.query('SHOW INDEX FROM users');
            console.log('\n🔍 Índices en tabla users:');
            usersIndexes.forEach((index: any) => {
                console.log(`   • ${index.Key_name}: ${index.Column_name} (${index.Index_type})`);
            });

            // Contar registros
            const [userCount] = await dataSource.query('SELECT COUNT(*) as count FROM users');
            console.log(`\n👥 Total de usuarios: ${userCount.count}`);
        } else {
            console.log('❌ Tabla users: NO EXISTE');
        }

        // Verificar tabla roles
        const [rolesTableExists] = await dataSource.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = 'roles'
        `, [process.env.DB_NAME || 'hogar_de_ancianos']);

        if (rolesTableExists.count > 0) {
            console.log('✅ Tabla roles: EXISTE');
            const [roleCount] = await dataSource.query('SELECT COUNT(*) as count FROM roles');
            console.log(`   📊 Total de roles: ${roleCount.count}`);
        } else {
            console.log('❌ Tabla roles: NO EXISTE');
        }

        // Listar todas las tablas
        const allTables = await dataSource.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [process.env.DB_NAME || 'hogar_de_ancianos']);

        console.log('\n📋 TODAS LAS TABLAS:');
        if (allTables.length > 0) {
            allTables.forEach((table: any) => {
                console.log(`   • ${table.table_name || table.TABLE_NAME}`);
            });
        } else {
            console.log('   ⚠️  No se encontraron tablas en la base de datos');
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