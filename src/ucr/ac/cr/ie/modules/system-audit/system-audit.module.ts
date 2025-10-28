import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAuditController } from './system-audit.controller';
import { SystemAuditService } from './system-audit.service';
import { SystemAuditRepository } from '../../repository/system-audit/system-audit.repository';
import { SystemEvent } from '../../domain/system-audit/system-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemEvent])],
  controllers: [SystemAuditController],
  providers: [SystemAuditService, SystemAuditRepository],
  exports: [SystemAuditService, SystemAuditRepository],
})
export class SystemAuditModule {}