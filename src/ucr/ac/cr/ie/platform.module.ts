import { Module } from '@nestjs/common';
import { PlatformController } from './controller/platform/platform.controller';
import { PlatformGuard, PlatformStepUpGuard } from './common/guards';

@Module({
  controllers: [PlatformController],
  providers: [PlatformGuard, PlatformStepUpGuard],
  exports: [PlatformGuard, PlatformStepUpGuard],
})
export class PlatformModule {}
