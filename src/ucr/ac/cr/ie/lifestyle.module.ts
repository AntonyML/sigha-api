import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { LifestyleController } from './controller/lifestyle';
import { LifestyleService } from './services/lifestyle';
import { lifestyleProviders } from './repository/lifestyle';
import { virtualRecordsProviders } from './repository/virtual-records';
import { PermissionsModule } from './permissions.module';

@Module({
    imports: [DatabaseModule, PermissionsModule],
    controllers: [LifestyleController],
    providers: [
        LifestyleService,
        ...lifestyleProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [LifestyleService],
})
export class LifestyleModule {}
