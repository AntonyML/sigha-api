import { Module } from '@nestjs/common';
import { SecurityAuditService } from './security-audit.service';
import { SecurityAuditController } from './security-audit.controller';
import { securityAuditProviders } from './security-audit.providers';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SecurityAuditController],
  providers: [
    SecurityAuditService,
    ...securityAuditProviders,
  ],
  exports: [SecurityAuditService],
})
export class SecurityAuditModule {}