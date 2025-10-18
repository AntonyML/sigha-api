import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import createSuperUsers from '../../../../../../scripts/create-super-users';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
    
    async onApplicationBootstrap() {
        try {
            console.log(' Aplicación iniciada - Ejecutando scripts de inicialización...');
            
            // Esperar un poco para asegurar que todas las conexiones estén listas
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Crear superusuarios si no existen
            await createSuperUsers();
            
            console.log(' Scripts de inicialización completados exitosamente');
        } catch (error) {
            console.error(' Error ejecutando scripts de inicialización:', error);
            // No detenemos la aplicación, solo loggeamos el error
        }
    }
}