import { Module } from '@nestjs/common';
import { EmergencyContactsController } from './controller/emergency-contacts/emergency-contacts.controller';
import { EmergencyContactsService } from './services/emergency-contacts/emergency-contacts.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [EmergencyContactsController],
    providers: [
        EmergencyContactsService,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'EmergencyContactRepository'
        ),
    ],
    exports: [EmergencyContactsService],
})
export class EmergencyContactsModule {}
