import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PermissionsModule } from './permissions.module';
import { AccessLogsController } from './controller/access-logs';
import { accessLogsProviders } from './repository/access-logs';
import { AccessLogsService } from './services/access-logs';

@Module({
  imports: [DatabaseModule, PermissionsModule],
  controllers: [AccessLogsController],
  providers: [AccessLogsService, ...accessLogsProviders],
})
export class AccessLogsModule {}
