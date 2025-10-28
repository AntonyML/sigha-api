import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { auditLogsProviders } from './audit-logs.providers';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    ...auditLogsProviders,
  ],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}