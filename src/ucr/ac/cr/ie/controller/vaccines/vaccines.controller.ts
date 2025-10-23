import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VaccinesService } from '../../services/vaccines/vaccines.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Vaccines')
@Controller('vaccines')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class VaccinesController {
    constructor(private readonly vaccinesService: VaccinesService) {}

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ 
        summary: 'Get all vaccines',
        description: 'Retrieves a list of all vaccines available in the system'
    })
    @ApiResponse({
        status: 200,
        description: 'Vaccines retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Vaccines retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            vName: { type: 'string', example: 'dT' }
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
    async getAllVaccines() {
        return this.vaccinesService.getAllVaccines();
    }
}