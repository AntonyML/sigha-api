import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../common/decorators';
import { JwtAuthGuard, ModulePermissionGuard } from '../../common/guards';
import { PermissionAction, PermissionModule } from '../../domain/permissions';
import { AccessLogFilterDto, CreateAccessLogDto } from '../../dto/access-logs';
import { AccessLogsService } from '../../services/access-logs';

@ApiTags('Entradas y salidas')
@ApiBearerAuth('jwt')
@Controller('access-logs')
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequirePermission(PermissionModule.ACCESS_LOGS, PermissionAction.VIEW)
export class AccessLogsController {
  constructor(private readonly accessLogsService: AccessLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar el historial de salidas, entradas y visitas' })
  findAll(@Query() filter: AccessLogFilterDto) {
    return this.accessLogsService.findAll(filter);
  }

  @Post()
  @RequirePermission(PermissionModule.ACCESS_LOGS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Registrar una salida, entrada/regreso o visita' })
  create(@Body() dto: CreateAccessLogDto, @Req() request: any) {
    return this.accessLogsService.create(dto, Number(request.user?.userId ?? request.user?.id));
  }
}
