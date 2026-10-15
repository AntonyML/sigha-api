import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
    PhysiotherapyEvaluationsService,
    PsychologyEvaluationsService,
    SocialWorkEvaluationsService
} from '../../services/specialties';
import {
    CreatePhysiotherapyEvaluationDto,
    CreatePsychologyEvaluationDto,
    CreateSocialWorkEvaluationDto
} from '../../dto/specialties';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Specialties (Evaluaciones Geriátricas Estandarizadas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('specialties')
export class SpecialtiesController {
    constructor(
        private readonly physiotherapyService: PhysiotherapyEvaluationsService,
        private readonly psychologyService: PsychologyEvaluationsService,
        private readonly socialWorkService: SocialWorkEvaluationsService,
    ) {}

    // --- Physiotherapy (Barthel) ---
    @Post('physiotherapy')
    @ApiOperation({ summary: 'Registrar evaluación de fisioterapia con cálculo automático de Índice de Barthel y Tinetti' })
    @ApiResponse({ status: 201, description: 'Evaluación registrada exitosamente' })
    async createPhysioEvaluation(@Body() dto: CreatePhysiotherapyEvaluationDto, @Req() request: any) {
        return this.physiotherapyService.create(dto, Number(request.user?.userId ?? request.user?.id));
    }

    @Get('physiotherapy/patient/:patientId')
    @ApiOperation({ summary: 'Listar evaluaciones de fisioterapia de un paciente' })
    async findPhysioByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.physiotherapyService.findByPatient(patientId);
    }

    @Get('physiotherapy/:id')
    @ApiOperation({ summary: 'Consultar evaluación de fisioterapia por ID' })
    async findPhysioById(@Param('id', ParseIntPipe) id: number) {
        return this.physiotherapyService.findById(id);
    }

    // --- Psychology (Yesavage GDS & Pfeiffer) ---
    @Post('psychology')
    @ApiOperation({ summary: 'Registrar evaluación psicológica con escalas Yesavage GDS (depresión) y Pfeiffer SPMSQ (cognitiva)' })
    @ApiResponse({ status: 201, description: 'Evaluación registrada exitosamente' })
    async createPsyEvaluation(@Body() dto: CreatePsychologyEvaluationDto, @Req() request: any) {
        return this.psychologyService.create(dto, Number(request.user?.userId ?? request.user?.id));
    }

    @Get('psychology/patient/:patientId')
    @ApiOperation({ summary: 'Listar evaluaciones psicológicas de un paciente' })
    async findPsyByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.psychologyService.findByPatient(patientId);
    }

    @Get('psychology/:id')
    @ApiOperation({ summary: 'Consultar evaluación psicológica por ID' })
    async findPsyById(@Param('id', ParseIntPipe) id: number) {
        return this.psychologyService.findById(id);
    }

    // --- Social Work (APGAR familiar) ---
    @Post('social-work')
    @ApiOperation({ summary: 'Registrar evaluación de trabajo social con escala APGAR familiar y red de apoyo' })
    @ApiResponse({ status: 201, description: 'Evaluación registrada exitosamente' })
    async createSocialWorkEvaluation(@Body() dto: CreateSocialWorkEvaluationDto, @Req() request: any) {
        return this.socialWorkService.create(dto, Number(request.user?.userId ?? request.user?.id));
    }

    @Get('social-work/patient/:patientId')
    @ApiOperation({ summary: 'Listar evaluaciones de trabajo social de un paciente' })
    async findSocialWorkByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.socialWorkService.findByPatient(patientId);
    }

    @Get('social-work/:id')
    @ApiOperation({ summary: 'Consultar evaluación de trabajo social por ID' })
    async findSocialWorkById(@Param('id', ParseIntPipe) id: number) {
        return this.socialWorkService.findById(id);
    }
}
