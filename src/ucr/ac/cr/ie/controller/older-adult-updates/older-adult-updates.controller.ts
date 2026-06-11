import { Controller, Get, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OlderAdultUpdatesService } from '../../services/older-adult-updates/older-adult-updates.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Older Adult Updates')
@Controller('older-adult-updates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class OlderAdultUpdatesController {
    constructor(private readonly olderAdultUpdatesService: OlderAdultUpdatesService) {}

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Get all older adult update logs', description: 'Retrieves the audit log of field changes on older adult records' })
    @ApiQuery({ name: 'olderAdultId', required: false, type: Number, description: 'Filter by older adult ID' })
    @ApiQuery({ name: 'fieldChanged', required: false, type: String, description: 'Filter by the field that was changed' })
    @ApiQuery({ name: 'changedBy', required: false, type: Number, description: 'Filter by the user who made the change' })
    @ApiResponse({ status: 200, description: 'Update logs retrieved successfully' })
    async findAll(
        @Query('olderAdultId') olderAdultId?: number,
        @Query('fieldChanged') fieldChanged?: string,
        @Query('changedBy') changedBy?: number
    ) {
        return this.olderAdultUpdatesService.findAll(
            olderAdultId ? +olderAdultId : undefined,
            fieldChanged,
            changedBy ? +changedBy : undefined
        );
    }

    @Get('by-older-adult/:olderAdultId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get update logs for a specific older adult', description: 'Retrieves all field change history for a given older adult' })
    @ApiResponse({ status: 200, description: 'Update logs retrieved successfully' })
    async findByOlderAdult(@Param('olderAdultId', ParseIntPipe) olderAdultId: number) {
        return this.olderAdultUpdatesService.findByOlderAdult(olderAdultId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Get a specific update log by ID' })
    @ApiResponse({ status: 200, description: 'Update log retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Update log not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.olderAdultUpdatesService.findOne(id);
    }
}
