import { Module } from '@nestjs/common';
import { NursingController, PhysiotherapyController, PsychologyController } from './controller/nursing';
import { NursingService, PhysiotherapyService, PsychologyService } from './services/nursing';
import { nursingProviders } from './repository/nursing';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [NursingController, PhysiotherapyController, PsychologyController],
    providers: [
        NursingService,
        PhysiotherapyService,
        PsychologyService,
        ...nursingProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        )
    ],
    exports: [NursingService, PhysiotherapyService, PsychologyService]
})
export class NursingModule {}
