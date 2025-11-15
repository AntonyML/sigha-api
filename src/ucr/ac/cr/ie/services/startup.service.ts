import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import createSuperUsers from '../../../../../../scripts/create-super-users';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
    private readonly logger = new Logger(StartupService.name);
    
    async onApplicationBootstrap() {
        try {
            this.logger.log('🚀 Iniciando configuración inicial del sistema...');
            
            // Esperar un poco para que la conexión DB esté completamente establecida
            await new Promise(resolve => setTimeout(resolve, 2000));

            await createSuperUsers();
            
            this.logger.log('✅ Configuración inicial completada exitosamente');
        } catch (error) {
            this.logger.error('💥 Error ejecutando scripts de inicialización:', error.message);
            
            // En lugar de fallar completamente, registrar el error y continuar
            // Esto permite que el servidor siga funcionando aunque no se puedan crear los usuarios
            if (error.message.includes('DROP INDEX') || error.message.includes('IDX_')) {
                this.logger.warn('⚠️  Problema de sincronización de base de datos detectado');
                this.logger.warn('💡 Sugerencia: Ejecutar el script de reset de base de datos');
                this.logger.warn('   Comando: npm run ts-node scripts/reset-database.ts');
            }
        }
    }
}