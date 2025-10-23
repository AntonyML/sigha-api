import { Module } from '@nestjs/common';
import { ClinicalConditionsController } from './controller/clinical-conditions';
import { ClinicalConditionsService } from './services/clinical-conditions/clinical-conditions.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ClinicalConditionsController],
    providers: [
        ClinicalConditionsService,
        ...virtualRecordsProviders.filter(provider => 
            provider.provide === 'ClinicalConditionRepository'
        )
    ],
    exports: [ClinicalConditionsService]
})
export class ClinicalConditionsModule {}