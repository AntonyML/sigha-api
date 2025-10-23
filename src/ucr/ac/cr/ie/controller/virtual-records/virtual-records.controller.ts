import { Controller, Post, Put, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VirtualRecordsService } from '../../services/virtual-records';
import { CreateVirtualRecordDirectDto, UpdateVirtualRecordDirectDto } from '../../dto/virtual-records';
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

    @Put(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ 
        summary: 'Update a virtual record',
        description: 'Updates a complete virtual record for an older adult. Replaces all existing data with the provided information, including program enrollment, family information, and clinical history. Arrays can be empty to clear existing data.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the older adult to update',
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Virtual record updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Virtual record updated successfully' },
                data: {
                    type: 'object',
                    description: 'Updated older adult record'
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
        description: 'Older adult not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Identification already exists for another older adult'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error during record update'
    })
    async updateVirtualRecord(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateDto: UpdateVirtualRecordDirectDto
    ) {
        // Ensure the ID in the URL matches the ID in the DTO
        updateDto.id = id;
        return this.virtualRecordsService.updateVirtualRecordDirect(updateDto);
    }
}