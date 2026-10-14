import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { InpatientController } from './controller/inpatient';
import { InpatientService } from './services/inpatient';
import { inpatientProviders } from './repository/inpatient';
import { virtualRecordsProviders } from './repository/virtual-records';

@Module({
    imports: [DatabaseModule],
    controllers: [InpatientController],
    providers: [
        InpatientService,
        ...inpatientProviders,
        ...virtualRecordsProviders.filter(provider =>
            provider.provide === 'OlderAdultRepository'
        ),
    ],
    exports: [InpatientService],
})
export class InpatientModule {}
