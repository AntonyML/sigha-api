import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PhysiotherapyService } from '../../services/nursing';
import { CreatePhysiotherapySessionDto, UpdatePhysiotherapySessionDto, PhysiotherapySessionFilterDto } from '../../dto/nursing';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Physiotherapy')
@Controller('physiotherapy')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class PhysiotherapyController {
    constructor(private readonly physiotherapyService: PhysiotherapyService) {}

    @Post('sessions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PHYSIOTHERAPIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Create a new physiotherapy session',
        description: 'Creates a new physiotherapy session for a specialized appointment'
    })
    @ApiResponse({
        status: 201,
        description: 'Physiotherapy session created successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    async createSession(@Body() createDto: CreatePhysiotherapySessionDto) {
        return this.physiotherapyService.createPhysiotherapySession(createDto);
    }

    @Get('sessions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PHYSIOTHERAPIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get physiotherapy sessions',
        description: 'Retrieve physiotherapy sessions, optionally filtered by appointment ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Sessions retrieved successfully'
    })
    @ApiQuery({
        name: 'appointmentId',
        required: false,
        type: Number,
        description: 'Filter by appointment ID'
    })
    async getSessions(@Query('appointmentId') appointmentId?: number) {
        return this.physiotherapyService.getPhysiotherapySessions(appointmentId);
    }

    @Get('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PHYSIOTHERAPIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get physiotherapy session by ID',
        description: 'Retrieve a specific physiotherapy session by its ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Physiotherapy session ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Session retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Session not found'
    })
    async getSessionById(@Param('id', ParseIntPipe) id: number) {
        return this.physiotherapyService.getPhysiotherapySessionById(id);
    }

    @Put('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PHYSIOTHERAPIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Update physiotherapy session',
        description: 'Update an existing physiotherapy session'
    })
    @ApiParam({
        name: 'id',
        description: 'Physiotherapy session ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Session updated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Session not found'
    })
    async updateSession(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePhysiotherapySessionDto) {
        return this.physiotherapyService.updatePhysiotherapySession(id, updateDto);
    }

    @Delete('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({
        summary: 'Delete physiotherapy session',
        description: 'Delete a physiotherapy session by ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Physiotherapy session ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Session deleted successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Session not found'
    })
    async deleteSession(@Param('id', ParseIntPipe) id: number) {
        return this.physiotherapyService.deletePhysiotherapySession(id);
    }
}