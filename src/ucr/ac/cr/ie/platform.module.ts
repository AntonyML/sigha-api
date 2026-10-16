import { Module } from '@nestjs/common';
import { PlatformController } from './controller/platform/platform.controller';
import { PlatformOrganizationsController } from './controller/platform/platform-organizations.controller';
import { PlatformOrganizationMembersController } from './controller/platform/platform-organization-members.controller';
import { PlatformOrganizationsService } from './services/platform/platform-organizations.service';
import { PlatformOrganizationMembersService } from './services/platform/platform-organization-members.service';
import { PlatformGuard, PlatformStepUpGuard } from './common/guards';
import { AuditModule } from './audit.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [
    PlatformController,
    PlatformOrganizationsController,
    PlatformOrganizationMembersController,
  ],
  providers: [
    PlatformGuard,
    PlatformStepUpGuard,
    PlatformOrganizationsService,
    PlatformOrganizationMembersService,
  ],
  exports: [PlatformGuard, PlatformStepUpGuard],
})
export class PlatformModule {}

