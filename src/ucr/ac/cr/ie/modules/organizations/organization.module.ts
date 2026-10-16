import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { SupabaseStorageService } from '../../infrastructure/storage/supabase-storage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, SupabaseStorageService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
