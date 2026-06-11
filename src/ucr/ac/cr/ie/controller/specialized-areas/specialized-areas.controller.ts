import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SpecializedAreasService } from '../../services/specialized-areas/specialized-areas.service';
import { CreateSpecializedAreaDto } from '../../dto/specialized-areas/create-specialized-area.dto';
import { UpdateSpecializedAreaDto } from '../../dto/specialized-areas/update-specialized-area.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Specialized Areas')
@Controller('specialized-areas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class SpecializedAreasController {
    constructor(private readonly specializedAreasService: SpecializedAreasService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Create a specialized area', description: 'Registers a new specialized care area (nursing, physiotherapy, etc.)' })
    @ApiResponse({ status: 201, description: 'Specialized area created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async create(@Body() dto: CreateSpecializedAreaDto) {
        return this.specializedAreasService.create(dto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get all specialized areas', description: 'Retrieves all specialized areas, optionally filtered to only active ones' })
    @ApiQuery({ name: 'onlyActive', required: false, type: Boolean, description: 'When true, returns only active areas' })
    @ApiResponse({ status: 200, description: 'Specialized areas retrieved successfully' })
    async findAll(@Query('onlyActive') onlyActive?: string) {
        const filterActive = onlyActive === 'true' ? true : undefined;
        return this.specializedAreasService.findAll(filterActive);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get a specialized area by ID' })
    @ApiResponse({ status: 200, description: 'Specialized area retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Specialized area not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.specializedAreasService.findOne(id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Update a specialized area' })
    @ApiResponse({ status: 200, description: 'Specialized area updated successfully' })
    @ApiResponse({ status: 404, description: 'Specialized area not found' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpecializedAreaDto) {
        return this.specializedAreasService.update(id, dto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Delete a specialized area' })
    @ApiResponse({ status: 200, description: 'Specialized area deleted successfully' })
    @ApiResponse({ status: 404, description: 'Specialized area not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.specializedAreasService.remove(id);
    }
}
