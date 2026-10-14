import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { SpecialtiesController } from './controller/specialties';
import {
    PhysiotherapyEvaluationsService,
    PsychologyEvaluationsService,
    SocialWorkEvaluationsService
} from './services/specialties';
import { specialtiesProviders } from './repository/specialties';
import { virtualRecordsProviders } from './repository/virtual-records';

@Module({
    imports: [DatabaseModule],
    controllers: [SpecialtiesController],
    providers: [
        PhysiotherapyEvaluationsService,
        PsychologyEvaluationsService,
        SocialWorkEvaluationsService,
        ...specialtiesProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [
        PhysiotherapyEvaluationsService,
        PsychologyEvaluationsService,
        SocialWorkEvaluationsService
    ],
})
export class SpecialtiesModule {}
