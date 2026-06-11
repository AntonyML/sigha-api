import { Module } from '@nestjs/common';
import { OlderAdultFamilyController } from './controller/older-adult-family/older-adult-family.controller';
import { OlderAdultFamilyService } from './services/older-adult-family/older-adult-family.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OlderAdultFamilyController],
    providers: [
        OlderAdultFamilyService,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultFamilyRepository'
        ),
    ],
    exports: [OlderAdultFamilyService],
})
export class OlderAdultFamilyModule {}
