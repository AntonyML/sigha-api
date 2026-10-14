import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { pharmacyProviders } from './repository/pharmacy';
import { virtualRecordsProviders } from './repository/virtual-records';
import { PharmacyService, KardexService } from './services/pharmacy';
import { PharmacyController, KardexController } from './controller/pharmacy';

@Module({
    imports: [DatabaseModule],
    controllers: [PharmacyController, KardexController],
    providers: [
        ...pharmacyProviders,
        ...virtualRecordsProviders.filter(provider => provider.provide === 'OlderAdultRepository'),
        PharmacyService,
        KardexService,
    ],
    exports: [PharmacyService, KardexService],
})
export class PharmacyModule {}
