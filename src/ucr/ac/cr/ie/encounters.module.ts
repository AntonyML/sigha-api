import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import {
    EncountersController,
    VitalSignsController,
    NursingRoundsController
} from './controller/encounters';
import {
    EncountersService,
    VitalSignsService,
    NursingRoundsService
} from './services/encounters';
import { encountersProviders } from './repository/encounters';
import { virtualRecordsProviders } from './repository/virtual-records';

@Module({
    imports: [DatabaseModule],
    controllers: [
        EncountersController,
        VitalSignsController,
        NursingRoundsController
    ],
    providers: [
        EncountersService,
        VitalSignsService,
        NursingRoundsService,
        ...encountersProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [
        EncountersService,
        VitalSignsService,
        NursingRoundsService
    ],
})
export class EncountersModule {}
