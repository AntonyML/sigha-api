import { Module } from '@nestjs/common';
import { SettingsController } from './controller/settings/settings.controller';
import { SettingsService } from './services/settings/settings.service';
import { settingsProviders } from './repository/settings/settings.providers';
import { DatabaseModule } from './database.module';
import { SupabaseStorageService } from './infrastructure/storage/supabase-storage.service';
import { GlobalSettingsStepUpGuard } from './common/guards';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders, SupabaseStorageService, GlobalSettingsStepUpGuard],
  exports: [SettingsService, SupabaseStorageService],
})
export class SettingsModule {}
