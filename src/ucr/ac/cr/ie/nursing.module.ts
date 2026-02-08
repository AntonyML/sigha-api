import { Module } from '@nestjs/common';
import { NursingController } from './controller/nursing';
import { NursingService, PhysiotherapyService } from './services/nursing';
import { nursingProviders } from './repository/nursing';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [NursingController],
    providers: [
        NursingService,
        PhysiotherapyService,
        ...nursingProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        )
    ],
    exports: [NursingService, PhysiotherapyService]
})
export class NursingModule {}
