import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmergencyContactsService } from '../../services/emergency-contacts/emergency-contacts.service';
import { CreateEmergencyContactDto } from '../../dto/emergency-contacts/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from '../../dto/emergency-contacts/update-emergency-contact.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Emergency Contacts')
@Controller('emergency-contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class EmergencyContactsController {
    constructor(private readonly emergencyContactsService: EmergencyContactsService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Create an emergency contact', description: 'Registers a new emergency contact for an older adult' })
    @ApiResponse({ status: 201, description: 'Emergency contact created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async create(@Body() dto: CreateEmergencyContactDto) {
        return this.emergencyContactsService.create(dto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get all emergency contacts', description: 'Retrieves all emergency contacts, optionally filtered by older adult ID' })
    @ApiQuery({ name: 'olderAdultId', required: false, type: Number, description: 'Filter by older adult ID' })
    @ApiResponse({ status: 200, description: 'Emergency contacts retrieved successfully' })
    async findAll(@Query('olderAdultId') olderAdultId?: number) {
        if (olderAdultId) {
            return this.emergencyContactsService.findByOlderAdult(+olderAdultId);
        }
        return this.emergencyContactsService.findAll();
    }

    @Get('by-older-adult/:olderAdultId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get emergency contacts by older adult', description: 'Retrieves all emergency contacts for a specific older adult' })
    @ApiResponse({ status: 200, description: 'Emergency contacts retrieved successfully' })
    async findByOlderAdult(@Param('olderAdultId', ParseIntPipe) olderAdultId: number) {
        return this.emergencyContactsService.findByOlderAdult(olderAdultId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get an emergency contact by ID' })
    @ApiResponse({ status: 200, description: 'Emergency contact retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Emergency contact not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.emergencyContactsService.findOne(id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Update an emergency contact' })
    @ApiResponse({ status: 200, description: 'Emergency contact updated successfully' })
    @ApiResponse({ status: 404, description: 'Emergency contact not found' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmergencyContactDto) {
        return this.emergencyContactsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Delete an emergency contact' })
    @ApiResponse({ status: 200, description: 'Emergency contact deleted successfully' })
    @ApiResponse({ status: 404, description: 'Emergency contact not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.emergencyContactsService.remove(id);
    }
}
