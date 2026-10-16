import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators';
import { ContactInquiryService } from '../../services/contact-inquiry';
import { CreateContactInquiryDto } from '../../dto/contact-inquiry';

@ApiTags('Contact Inquiries')
@Controller('contact-inquiries')
export class ContactInquiryController {
  constructor(private readonly contactInquiryService: ContactInquiryService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5, blockDuration: 60000 } })
  @ApiOperation({
    summary: 'Enviar consulta de contacto desde la web pública',
    description:
      'Recibe una consulta de la página de contacto web, notifica a la administración de SIGHA y envía un acuse de recibo al usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tu consulta ha sido enviada satisfactoriamente. Nos comunicaremos pronto.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos en el formulario' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes. Intente más tarde.' })
  async createInquiry(@Body() dto: CreateContactInquiryDto) {
    return this.contactInquiryService.processInquiry(dto);
  }
}
