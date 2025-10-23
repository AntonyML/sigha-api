import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from '../../services/programs/programs.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Programs')
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) {}

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