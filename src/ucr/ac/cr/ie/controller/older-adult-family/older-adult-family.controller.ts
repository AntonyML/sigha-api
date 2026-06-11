import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OlderAdultFamilyService } from '../../services/older-adult-family/older-adult-family.service';
import { CreateOlderAdultFamilyDto } from '../../dto/older-adult-family/create-older-adult-family.dto';
import { UpdateOlderAdultFamilyDto } from '../../dto/older-adult-family/update-older-adult-family.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Older Adult Family')
@Controller('older-adult-family')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class OlderAdultFamilyController {
    constructor(private readonly olderAdultFamilyService: OlderAdultFamilyService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Create a family member record', description: 'Registers a new family member associated with an older adult' })
    @ApiResponse({ status: 201, description: 'Family member created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async create(@Body() dto: CreateOlderAdultFamilyDto) {
        return this.olderAdultFamilyService.create(dto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get all family member records', description: 'Retrieves all older adult family member records' })
    @ApiResponse({ status: 200, description: 'Family members retrieved successfully' })
    async findAll() {
        return this.olderAdultFamilyService.findAll();
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get a family member record by ID' })
    @ApiResponse({ status: 200, description: 'Family member retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Family member not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.olderAdultFamilyService.findOne(id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Update a family member record' })
    @ApiResponse({ status: 200, description: 'Family member updated successfully' })
    @ApiResponse({ status: 404, description: 'Family member not found' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOlderAdultFamilyDto) {
        return this.olderAdultFamilyService.update(id, dto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Delete a family member record' })
    @ApiResponse({ status: 200, description: 'Family member deleted successfully' })
    @ApiResponse({ status: 404, description: 'Family member not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.olderAdultFamilyService.remove(id);
    }
}
