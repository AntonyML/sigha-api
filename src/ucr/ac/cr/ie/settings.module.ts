import { Module } from '@nestjs/common';
import { SettingsController } from './controller/settings/settings.controller';
import { SettingsService } from './services/settings/settings.service';
import { settingsProviders } from './repository/settings/settings.providers';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders],
  exports: [SettingsService],
})
export class SettingsModule {}
