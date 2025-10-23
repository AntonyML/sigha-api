import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from '../../services/programs/programs.service';
import { CreateProgramDto } from '../../dto/programs';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Programs')
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Create a new program',
        description: 'Creates a new program in the system'
    })
    @ApiResponse({
        status: 201,
        description: 'Program created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Program created successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        pName: { type: 'string', example: 'Hogar de Larga Instancia' },
                        createAt: { type: 'string', format: 'date-time' }
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
        description: 'Program with this name already exists'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async createProgram(@Body() createProgramDto: CreateProgramDto) {
        return this.programsService.createProgram(createProgramDto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get all programs',
        description: 'Retrieves a list of all programs with their associated sub-programs'
    })
    @ApiResponse({
        status: 200,
        description: 'Programs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Programs retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            pName: { type: 'string', example: 'Hogar de Larga Instancia' },
                            createAt: { type: 'string', format: 'date-time' },
                            subPrograms: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', example: 1 },
                                        spName: { type: 'string', example: 'Cuidado General' },
                                        idProgram: { type: 'number', example: 1 }
                                    }
                                }
                            }
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
    async getAllPrograms() {
        return this.programsService.getAllPrograms();
    }
}