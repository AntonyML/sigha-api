import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalConditionsService } from '../../services/clinical-conditions/clinical-conditions.service';
import { CreateClinicalConditionDto } from '../../dto/clinical-conditions';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Clinical Conditions')
@Controller('clinical-conditions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class ClinicalConditionsController {
    constructor(private readonly clinicalConditionsService: ClinicalConditionsService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Create a new clinical condition',
        description: 'Creates a new clinical condition in the system'
    })
    @ApiResponse({
        status: 201,
        description: 'Clinical condition created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Clinical condition created successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        ccName: { type: 'string', example: 'Hipertensión arterial (HTA)' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 409,
        description: 'Clinical condition with this name already exists'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async createClinicalCondition(@Body() createClinicalConditionDto: CreateClinicalConditionDto) {
        return this.clinicalConditionsService.createClinicalCondition(createClinicalConditionDto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get all clinical conditions',
        description: 'Retrieves a list of all clinical conditions available in the system'
    })
    @ApiResponse({
        status: 200,
        description: 'Clinical conditions retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Clinical conditions retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            ccName: { type: 'string', example: 'HTA' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getAllClinicalConditions() {
        return this.clinicalConditionsService.getAllClinicalConditions();
    }
}