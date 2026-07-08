import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import {
  IdentificationLookupService,
  IdentificationLookupResult,
} from '../../services/identification-lookup/identification-lookup.service';

@ApiTags('identification-lookup')
@ApiBearerAuth('jwt')
@Controller('identification-lookup')
export class IdentificationLookupController {
  constructor(private readonly identificationLookupService: IdentificationLookupService) {}

  @Get()
  @ApiQuery({ name: 'identification', required: true, description: 'Número de identificación (solo dígitos)' })
  @ApiOkResponse({ description: 'Resultado normalizado de la búsqueda de identificación' })
  async lookup(@Query('identification') identification: string): Promise<IdentificationLookupResult> {
    const digits = (identification || '').replace(/[^0-9]/g, '');
    return this.identificationLookupService.lookupByIdentification(digits);
  }
}
