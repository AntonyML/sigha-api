import { Module } from '@nestjs/common';
import { AuditReportsService } from './audit-reports.service';
import { AuditReportsController } from './audit-reports.controller';
import { auditReportsProviders } from './audit-reports.providers';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditReportsController],
  providers: [
    AuditReportsService,
    ...auditReportsProviders,
  ],
  exports: [AuditReportsService],
})
export class AuditReportsModule {}