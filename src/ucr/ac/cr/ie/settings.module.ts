import { Module } from '@nestjs/common';
import { SettingsController } from './controller/settings/settings.controller';
import { SettingsService } from './services/settings/settings.service';
import { settingsProviders } from './repository/settings/settings.providers';
import { DatabaseModule } from './database.module';
import { SupabaseStorageService } from './infrastructure/storage/supabase-storage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...settingsProviders, SupabaseStorageService],
  exports: [SettingsService, SupabaseStorageService],
})
export class SettingsModule {}
