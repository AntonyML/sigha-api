import { Module } from '@nestjs/common';
import { NursingController, PhysiotherapyController, PsychologyController, MedicalRecordController } from './controller/nursing';
import { NursingService, PhysiotherapyService, PsychologyService, MedicalRecordService } from './services/nursing';
import { nursingProviders } from './repository/nursing';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [NursingController, PhysiotherapyController, PsychologyController, MedicalRecordController],
    providers: [
        NursingService,
        PhysiotherapyService,
        PsychologyService,
        MedicalRecordService,
        ...nursingProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        )
    ],
    exports: [NursingService, PhysiotherapyService, PsychologyService, MedicalRecordService]
})
export class NursingModule {}
