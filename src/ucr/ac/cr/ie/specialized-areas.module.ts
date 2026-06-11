import { Module } from '@nestjs/common';
import { SpecializedAreasController } from './controller/specialized-areas/specialized-areas.controller';
import { SpecializedAreasService } from './services/specialized-areas/specialized-areas.service';
import { nursingProviders } from './repository/nursing';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [SpecializedAreasController],
    providers: [
        SpecializedAreasService,
        ...nursingProviders.filter(provider =>
            provider.provide === 'SpecializedAreaRepository'
        ),
    ],
    exports: [SpecializedAreasService],
})
export class SpecializedAreasModule {}
