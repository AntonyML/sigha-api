import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VirtualRecordsService } from '../../services/virtual-records';
import { CreateVirtualRecordDirectDto } from '../../dto/virtual-records';
import { OlderAdult } from '../../domain/virtual-records';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Virtual Records')
@Controller('virtual-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class VirtualRecordsController {
    constructor(private readonly virtualRecordsService: VirtualRecordsService) {}

    @Post('create')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Create a new virtual record',
        description: 'Creates a comprehensive virtual record for an older adult including program enrollment, family information, and clinical history'
    })
    @ApiResponse({
        status: 201,
        description: 'Virtual record created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record created successfully' },
                data: {
                    type: 'object',
                    description: 'Created older adult record'
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
        description: 'Older adult with this identification already exists'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during record creation'
    })
    async createVirtualRecord(@Body() createDto: CreateVirtualRecordDirectDto) {
        return this.virtualRecordsService.createVirtualRecordDirect(createDto);
    }
}