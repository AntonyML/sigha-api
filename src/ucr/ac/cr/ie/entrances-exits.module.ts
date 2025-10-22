import { Module } from '@nestjs/common';
import { EntranceExitController } from './controller/entrances-exits/entrance-exit.controller';
import { EntranceExitService } from './services/entrances-exits/entrance-exit.service';
import { entranceExitProviders } from './repository/entrances-exits/entrance-exit.providers';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [EntranceExitController],
    providers: [
        ...entranceExitProviders,
        EntranceExitService,
    ],
    exports: [EntranceExitService],
})
export class EntrancesExitsModule { }