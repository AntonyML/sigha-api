import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from '../../services/programs/programs.service';
import { CreateSubProgramDto } from '../../dto/programs';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Sub Programs')
@Controller('sub-programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class SubProgramsController {
    constructor(private readonly programsService: ProgramsService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Create a new sub-program',
        description: 'Creates a new sub-program associated with an existing program'
    })
    @ApiResponse({
        status: 201,
        description: 'Sub-program created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Sub-program created successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        spName: { type: 'string', example: 'Cuidado General' },
                        idProgram: { type: 'number', example: 1 }
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
        status: 404,
        description: 'Program not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Sub-program with this name already exists for this program'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async createSubProgram(@Body() createSubProgramDto: CreateSubProgramDto) {
        return this.programsService.createSubProgram(createSubProgramDto);
    }
}