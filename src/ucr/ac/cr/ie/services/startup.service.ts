import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import createSuperUsers from '../../../../../../scripts/create-super-users';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
    
    async onApplicationBootstrap() {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            await createSuperUsers();
        } catch (error) {
            console.error(' Error ejecutando scripts de inicialización:', error);
        }
    }
}