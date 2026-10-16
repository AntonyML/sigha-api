import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LifestyleService } from '../../services/lifestyle';
import { CreateLifestyleAssessmentDto } from '../../dto/lifestyle';
import { RequirePermission } from '../../common/decorators';
import { JwtAuthGuard, ModulePermissionGuard } from '../../common/guards';
import { PermissionAction, PermissionModule } from '../../domain/permissions';

@ApiTags('Lifestyle (Estilo de Vida y Hábitos Geriátricos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@Controller('lifestyle')
@RequirePermission(PermissionModule.LIFESTYLE, PermissionAction.VIEW)
export class LifestyleController {
    constructor(private readonly lifestyleService: LifestyleService) {}

    @Post('assessments')
    @RequirePermission(PermissionModule.LIFESTYLE, PermissionAction.CREATE)
    @ApiOperation({ summary: 'Registrar nueva evaluación de estilo de vida y hábitos geriátricos (GNU Health health_lifestyle)' })
    @ApiResponse({ status: 201, description: 'Evaluación registrada exitosamente' })
    async createAssessment(@Body() dto: CreateLifestyleAssessmentDto, @Req() req: any) {
        const userId = req.user?.userId || req.user?.id;
        return this.lifestyleService.createAssessment(dto, userId);
    }

    @Get('patient/:id')
    @ApiOperation({ summary: 'Consultar la evaluación de estilo de vida más reciente de un adulto mayor' })
    async getLatestAssessment(@Param('id', ParseIntPipe) id: number) {
        return this.lifestyleService.getLatestAssessment(id);
    }

    @Get('patient/:id/history')
    @ApiOperation({ summary: 'Consultar el historial cronológico de evaluaciones de estilo de vida de un adulto mayor' })
    async getAssessmentHistory(@Param('id', ParseIntPipe) id: number) {
        return this.lifestyleService.getAssessmentHistory(id);
    }
}
