import { Module } from '@nestjs/common';
import { PlatformController } from './controller/platform/platform.controller';
import { PlatformOrganizationsController } from './controller/platform/platform-organizations.controller';
import { PlatformOrganizationsService } from './services/platform/platform-organizations.service';
import { PlatformGuard, PlatformStepUpGuard } from './common/guards';
import { AuditModule } from './audit.module';

@Module({
  imports: [AuditModule],
  controllers: [PlatformController, PlatformOrganizationsController],
  providers: [PlatformGuard, PlatformStepUpGuard, PlatformOrganizationsService],
  exports: [PlatformGuard, PlatformStepUpGuard],
})
export class PlatformModule {}
