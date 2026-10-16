import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InpatientService } from '../../services/inpatient';
import { CreateRoomDto, AssignBedDto } from '../../dto/inpatient';
import { RequirePermission } from '../../common/decorators';
import { JwtAuthGuard, ModulePermissionGuard } from '../../common/guards';
import { PermissionAction, PermissionModule } from '../../domain/permissions';

@ApiTags('Inpatient (Habitaciones y Camas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModulePermissionGuard)
@Controller('inpatient')
@RequirePermission(PermissionModule.BEDS, PermissionAction.VIEW)
export class InpatientController {
    constructor(private readonly inpatientService: InpatientService) {}

    @Post('rooms')
    @RequirePermission(PermissionModule.BEDS, PermissionAction.CREATE)
    @ApiOperation({ summary: 'Registrar una nueva habitación en el centro residencial' })
    @ApiResponse({ status: 201, description: 'Habitación creada exitosamente' })
    async createRoom(@Body() dto: CreateRoomDto) {
        return this.inpatientService.createRoom(dto);
    }

    @Get('rooms')
    @ApiOperation({ summary: 'Listar habitaciones del centro residencial' })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
    async findAllRooms(@Query('activeOnly') activeOnly?: string) {
        return this.inpatientService.findAllRooms(activeOnly === 'true');
    }

    @Get('rooms/:id')
    @ApiOperation({ summary: 'Consultar habitación por ID' })
    async findRoomById(@Param('id', ParseIntPipe) id: number) {
        return this.inpatientService.findRoomById(id);
    }

    @Post('beds/assign')
    @RequirePermission(PermissionModule.BEDS, PermissionAction.CREATE)
    @ApiOperation({ summary: 'Asignar o reubicar de cama a un adulto mayor' })
    @ApiResponse({ status: 201, description: 'Cama asignada exitosamente' })
    async assignBed(@Body() dto: AssignBedDto) {
        return this.inpatientService.assignBed(dto);
    }

    @Get('beds/current')
    @ApiOperation({ summary: 'Listar todas las asignaciones de cama activas actualmente' })
    async getAllCurrentAssignments() {
        return this.inpatientService.getAllCurrentAssignments();
    }

    @Get('beds/patient/:id')
    @ApiOperation({ summary: 'Consultar la habitación y cama actual asignada a un adulto mayor' })
    async getCurrentBedAssignment(@Param('id', ParseIntPipe) id: number) {
        return this.inpatientService.getCurrentBedAssignment(id);
    }
}
