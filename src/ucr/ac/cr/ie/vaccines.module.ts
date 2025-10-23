import { Module } from '@nestjs/common';
import { VaccinesController } from './controller/vaccines';
import { VaccinesService } from './services/vaccines/vaccines.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [VaccinesController],
    providers: [
        VaccinesService,
        ...virtualRecordsProviders.filter(provider => 
            provider.provide === 'VaccineRepository'
        )
    ],
    exports: [VaccinesService]
})
export class VaccinesModule {}