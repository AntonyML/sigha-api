import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PermissionsModule } from './permissions.module';
import { CarePlanningController } from './controller/care-planning';
import { carePlanningProviders } from './repository/care-planning';
import { CarePlanningService } from './services/care-planning';

@Module({
  imports: [DatabaseModule, PermissionsModule],
  controllers: [CarePlanningController],
  providers: [CarePlanningService, ...carePlanningProviders],
})
export class CarePlanningModule {}
