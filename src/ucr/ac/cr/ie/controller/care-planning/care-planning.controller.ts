import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission, Roles } from '../../common/decorators';
import { JwtAuthGuard, ModulePermissionGuard } from '../../common/guards';
import { PermissionAction, PermissionModule } from '../../domain/permissions';
import {
  CreateCareProgramDto,
  CreateCareSubProgramDto,
  CreateResidentProgramEnrollmentDto,
  ResidentProgramEnrollmentFilterDto,
  UpdateResidentProgramEnrollmentDto,
} from '../../dto/care-planning';
import { CarePlanningService } from '../../services/care-planning';

@ApiTags('Planes de cuidado')
@ApiBearerAuth('jwt')
@Controller('care-plans')
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@RequirePermission(PermissionModule.CARE_PLANS, PermissionAction.VIEW)
export class CarePlanningController {
  constructor(private readonly carePlanningService: CarePlanningService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Listar programas y subprogramas de cuidado activos' })
  getCatalog() {
    return this.carePlanningService.getCatalog();
  }

  @Post('catalog/programs')
  @RequirePermission(PermissionModule.CARE_PLANS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Crear un programa de cuidado para la organización activa' })
  createProgram(@Body() dto: CreateCareProgramDto) {
    return this.carePlanningService.createProgram(dto);
  }

  @Post('catalog/subprograms')
  @RequirePermission(PermissionModule.CARE_PLANS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Crear un subprograma de cuidado' })
  createSubprogram(@Body() dto: CreateCareSubProgramDto) {
    return this.carePlanningService.createSubprogram(dto);
  }

  @Get('scale-evaluations')
  @ApiOperation({ summary: 'Consultar evaluaciones de escala clínica de un residente' })
  getScaleEvaluations(@Query('residentId', ParseIntPipe) residentId: number) {
    return this.carePlanningService.getScaleEvaluations(residentId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Listar inscripciones de residentes en planes de cuidado' })
  getEnrollments(@Query() filter: ResidentProgramEnrollmentFilterDto) {
    return this.carePlanningService.getEnrollments(filter);
  }

  @Post('enrollments')
  @RequirePermission(PermissionModule.CARE_PLANS, PermissionAction.CREATE)
  @ApiOperation({ summary: 'Inscribir un residente en un subprograma de cuidado' })
  createEnrollment(@Body() dto: CreateResidentProgramEnrollmentDto, @Req() request: any) {
    return this.carePlanningService.createEnrollment(dto, Number(request.user?.userId ?? request.user?.id));
  }

  @Patch('enrollments/:id')
  @RequirePermission(PermissionModule.CARE_PLANS, PermissionAction.EDIT)
  @ApiOperation({ summary: 'Actualizar metas, evaluación, estado y fechas de una inscripción' })
  updateEnrollment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResidentProgramEnrollmentDto,
  ) {
    return this.carePlanningService.updateEnrollment(id, dto);
  }
}
