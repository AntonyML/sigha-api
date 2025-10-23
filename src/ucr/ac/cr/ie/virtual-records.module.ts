import { Module } from '@nestjs/common';
import { VirtualRecordsService } from './services/virtual-records';
import { VirtualRecordsController } from './controller/virtual-records';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [VirtualRecordsController],
    providers: [
        ...virtualRecordsProviders,
        VirtualRecordsService,
    ],
    exports: [VirtualRecordsService]
})
export class VirtualRecordsModule {}