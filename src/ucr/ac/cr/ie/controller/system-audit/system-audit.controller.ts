import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from '../../common/decorators';
import { JwtAuthGuard, ModulePermissionGuard } from '../../common/guards';
import { PermissionAction, PermissionModule } from '../../domain/permissions';
import { SystemAuditFilterDto } from '../../dto/system-audit';
import { SystemAuditService } from '../../services/system-audit';

@ApiTags('Auditoría administrativa del sistema')
@ApiBearerAuth('jwt')
@Controller('system-audit-logs')
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequirePermission(PermissionModule.SYSTEM_AUDIT, PermissionAction.VIEW)
export class SystemAuditController {
  constructor(private readonly systemAuditService: SystemAuditService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar auditoría administrativa de solo lectura' })
  findAll(@Query() filter: SystemAuditFilterDto) {
    return this.systemAuditService.findAll(filter);
  }
}
