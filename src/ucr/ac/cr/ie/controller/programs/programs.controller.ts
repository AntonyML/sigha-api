import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from '../../services/programs/programs.service';
import { CreateProgramDto, UpdateProgramDto } from '../../dto/programs';
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

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get a program by id',
        description: 'Retrieves a single program with its associated sub-programs'
    })
    @ApiResponse({
        status: 200,
        description: 'Program retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Program not found'
    })
    async getProgramById(@Param('id', ParseIntPipe) id: number) {
        return this.programsService.getProgramById(id);
    }

    @Put(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Update a program',
        description: 'Updates the name of an existing program'
    })
    @ApiResponse({
        status: 200,
        description: 'Program updated successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Program not found'
    })
    @ApiResponse({
        status: 409,
        description: 'A program with this name already exists'
    })
    async updateProgram(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProgramDto: UpdateProgramDto
    ) {
        return this.programsService.updateProgram(id, updateProgramDto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Delete a program',
        description: 'Deletes a program that has no associated sub-programs'
    })
    @ApiResponse({
        status: 200,
        description: 'Program deleted successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Program not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Cannot delete a program that has associated sub-programs'
    })
    async deleteProgram(@Param('id', ParseIntPipe) id: number) {
        return this.programsService.deleteProgram(id);
    }
}