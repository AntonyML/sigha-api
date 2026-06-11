import { Module } from '@nestjs/common';
import { OlderAdultUpdatesController } from './controller/older-adult-updates/older-adult-updates.controller';
import { OlderAdultUpdatesService } from './services/older-adult-updates/older-adult-updates.service';
import { auditProviders } from './repository/audit';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OlderAdultUpdatesController],
    providers: [
        OlderAdultUpdatesService,
        ...auditProviders.filter(provider =>
            provider.provide === 'OLDER_ADULT_UPDATE_REPOSITORY'
        ),
    ],
    exports: [OlderAdultUpdatesService],
})
export class OlderAdultUpdatesModule {}
