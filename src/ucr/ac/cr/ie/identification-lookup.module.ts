import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { IdentificationLookupController } from './controller/identification-lookup/identification-lookup.controller';
import { IdentificationLookupService } from './services/identification-lookup/identification-lookup.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 86400000,
      max: 10000,
    }),
  ],
  controllers: [IdentificationLookupController],
  providers: [IdentificationLookupService],
  exports: [IdentificationLookupService],
})
export class IdentificationLookupModule {}
