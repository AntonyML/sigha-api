import { Module } from '@nestjs/common';
import { ProgramsController } from './controller/programs';
import { SubProgramsController } from './controller/sub-programs/sub-programs.controller';
import { ProgramsService } from './services/programs/programs.service';
import { virtualRecordsProviders } from './repository/virtual-records';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ProgramsController, SubProgramsController],
    providers: [
        ProgramsService,
        ...virtualRecordsProviders.filter(provider => 
            provider.provide === 'ProgramRepository' || 
            provider.provide === 'SubProgramRepository'
        )
    ],
    exports: [ProgramsService]
})
export class ProgramsModule {}