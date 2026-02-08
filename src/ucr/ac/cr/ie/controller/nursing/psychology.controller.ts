import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PsychologyService } from '../../services/nursing';
import { CreatePsychologySessionDto, UpdatePsychologySessionDto, PsychologySessionFilterDto } from '../../dto/nursing';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Psychology')
@Controller('psychology')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class PsychologyController {
    constructor(private readonly psychologyService: PsychologyService) {}

    @Post('sessions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PSYCHOLOGIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Create a new psychology session',
        description: 'Creates a new psychology session for a specialized appointment'
    })
    @ApiResponse({
        status: 201,
        description: 'Psychology session created successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    async createSession(@Body() createDto: CreatePsychologySessionDto) {
        return this.psychologyService.createPsychologySession(createDto);
    }

    @Get('sessions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PSYCHOLOGIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get psychology sessions',
        description: 'Retrieve psychology sessions, optionally filtered by appointment ID'
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
        return this.psychologyService.getPsychologySessions(appointmentId);
    }

    @Get('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PSYCHOLOGIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get psychology session by ID',
        description: 'Retrieve a specific psychology session by its ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Psychology session ID',
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
        return this.psychologyService.getPsychologySessionById(id);
    }

    @Put('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.PSYCHOLOGIST, RoleType.NURSE)
    @ApiOperation({
        summary: 'Update psychology session',
        description: 'Update an existing psychology session'
    })
    @ApiParam({
        name: 'id',
        description: 'Psychology session ID',
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
    async updateSession(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePsychologySessionDto) {
        return this.psychologyService.updatePsychologySession(id, updateDto);
    }

    @Delete('sessions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({
        summary: 'Delete psychology session',
        description: 'Delete a psychology session by ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Psychology session ID',
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
        return this.psychologyService.deletePsychologySession(id);
    }
}