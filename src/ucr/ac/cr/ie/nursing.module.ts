import { Module } from '@nestjs/common';
import { NursingController, PhysiotherapyController, PsychologyController, MedicalRecordController, SocialWorkController } from './controller/nursing';
import { NursingService, PhysiotherapyService, PsychologyService, MedicalRecordService, SocialWorkService } from './services/nursing';
import { nursingProviders } from './repository/nursing';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [NursingController, PhysiotherapyController, PsychologyController, MedicalRecordController, SocialWorkController],
    providers: [
        NursingService,
        PhysiotherapyService,
        PsychologyService,
        MedicalRecordService,
        SocialWorkService,
        ...nursingProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        )
    ],
    exports: [NursingService, PhysiotherapyService, PsychologyService, MedicalRecordService, SocialWorkService]
})
export class NursingModule {}
