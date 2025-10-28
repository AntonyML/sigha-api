import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsRepository } from '../../repository/activity-logs/activity-logs.repository';
import { ActivityLog } from '../../domain/activity-logs/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService, ActivityLogsRepository],
  exports: [ActivityLogsService, ActivityLogsRepository],
})
export class ActivityLogsModule {}