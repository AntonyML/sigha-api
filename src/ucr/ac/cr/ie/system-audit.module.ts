import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PermissionsModule } from './permissions.module';
import { SystemAuditController } from './controller/system-audit';
import { systemAuditProviders } from './repository/system-audit';
import { SystemAuditService } from './services/system-audit';

@Module({
  imports: [DatabaseModule, PermissionsModule],
  controllers: [SystemAuditController],
  providers: [SystemAuditService, ...systemAuditProviders],
})
export class SystemAuditModule {}
