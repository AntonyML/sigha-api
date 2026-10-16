import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { KardexService } from '../../services/pharmacy/kardex.service';
import { RecordAdministrationDto, KardexQueryDto } from '../../dto/pharmacy';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Kardex MAR')
@Controller('kardex')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class KardexController {
    constructor(private readonly kardexService: KardexService) {}

    @Get()
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({
        summary: 'Consultar hoja de administración de medicamentos (Kardex diario)',
        description: 'Genera o recupera los horarios de toma de medicamentos del día para uno o todos los residentes',
    })
    @ApiResponse({ status: 200, description: 'Hoja Kardex recuperada exitosamente' })
    async getDailyKardex(@Query() query: KardexQueryDto) {
        return this.kardexService.getDailyKardex(query);
    }

    @Post('record')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({
        summary: 'Registrar toma o administración de dosis en el Kardex',
        description: 'Permite a enfermería marcar una dosis como administrada, omitida o rechazada con sus respectivas observaciones',
    })
    @ApiResponse({ status: 200, description: 'Administración registrada exitosamente' })
    async recordAdministration(@Body() dto: RecordAdministrationDto, @Req() req: any) {
        const staffId = Number(req.user?.userId ?? req.user?.id);
        return this.kardexService.recordAdministration(dto, staffId);
    }
}
