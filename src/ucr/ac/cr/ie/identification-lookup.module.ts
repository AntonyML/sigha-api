import { Module } from '@nestjs/common';
import { IdentificationLookupController } from './controller/identification-lookup/identification-lookup.controller';
import { IdentificationLookupService } from './services/identification-lookup/identification-lookup.service';

@Module({
  controllers: [IdentificationLookupController],
  providers: [IdentificationLookupService],
})
export class IdentificationLookupModule {}
