import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SocialWorkService } from '../../services/nursing';
import { CreateSocialWorkReportDto, UpdateSocialWorkReportDto } from '../../dto/nursing';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Social Work')
@Controller('social-work')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class SocialWorkController {
    constructor(private readonly socialWorkService: SocialWorkService) {}

    @Post('reports')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.SOCIAL_WORKER, RoleType.NURSE)
    @ApiOperation({
        summary: 'Create a new social work report',
        description: 'Creates a new social work report for a patient linked to a specialized appointment. The appointment must belong to the Social Work area.'
    })
    @ApiBody({
        type: CreateSocialWorkReportDto,
        description: 'Social work report data including patient ID and appointment ID'
    })
    @ApiResponse({
        status: 201,
        description: 'Social work report created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Social work report created successfully' },
                data: { $ref: '#/components/schemas/SocialWorkReport' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data or appointment does not belong to social work'
    })
    @ApiResponse({
        status: 404,
        description: 'Patient or appointment not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - JWT token required'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions'
    })
    async createReport(@Body() createDto: CreateSocialWorkReportDto) {
        return this.socialWorkService.createSocialWorkReport(createDto);
    }

    @Get('reports')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.SOCIAL_WORKER, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get social work reports',
        description: 'Retrieve social work reports, optionally filtered by patient ID. Returns reports with patient, social worker, and appointment information.'
    })
    @ApiResponse({
        status: 200,
        description: 'Reports retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Social work reports retrieved successfully' },
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SocialWorkReport' }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - JWT token required'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions'
    })
    @ApiQuery({
        name: 'patientId',
        required: false,
        type: Number,
        description: 'Filter reports by patient ID'
    })
    async getReports(@Query('patientId') patientId?: number) {
        return this.socialWorkService.getSocialWorkReports(patientId);
    }

    @Get('reports/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.SOCIAL_WORKER, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get social work report by ID',
        description: 'Retrieve a specific social work report by its ID with complete patient, social worker, and appointment information'
    })
    @ApiParam({
        name: 'id',
        description: 'Social work report ID',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Report retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Social work report retrieved successfully' },
                data: { $ref: '#/components/schemas/SocialWorkReport' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - JWT token required'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions'
    })
    async getReportById(@Param('id', ParseIntPipe) id: number) {
        return this.socialWorkService.getSocialWorkReportById(id);
    }

    @Put('reports/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.SOCIAL_WORKER, RoleType.NURSE)
    @ApiOperation({
        summary: 'Update social work report',
        description: 'Update an existing social work report. If appointment ID is provided, it must belong to the Social Work area.'
    })
    @ApiParam({
        name: 'id',
        description: 'Social work report ID',
        type: Number,
        example: 1
    })
    @ApiBody({
        type: UpdateSocialWorkReportDto,
        description: 'Fields to update in the social work report'
    })
    @ApiResponse({
        status: 200,
        description: 'Report updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Social work report updated successfully' },
                data: { $ref: '#/components/schemas/SocialWorkReport' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data or appointment does not belong to social work'
    })
    @ApiResponse({
        status: 404,
        description: 'Report or appointment not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - JWT token required'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions'
    })
    async updateReport(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateSocialWorkReportDto) {
        return this.socialWorkService.updateSocialWorkReport(id, updateDto);
    }

    @Delete('reports/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({
        summary: 'Delete social work report',
        description: 'Delete a social work report by ID. Only administrators can perform this action.'
    })
    @ApiParam({
        name: 'id',
        description: 'Social work report ID',
        type: Number,
        example: 1
    })
    @ApiResponse({
        status: 200,
        description: 'Report deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Social work report deleted successfully' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Report not found'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - JWT token required'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions (Admin only)'
    })
    async deleteReport(@Param('id', ParseIntPipe) id: number) {
        return this.socialWorkService.deleteSocialWorkReport(id);
    }
}