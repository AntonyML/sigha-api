import { Controller, Get, Post, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleChangesService } from '../../services/role-changes/role-changes.service';
import { CreateRoleChangeDto } from '../../dto/role-changes/create-role-change.dto';
import { SearchRoleChangesDto } from '../../dto/role-changes/search-role-changes.dto';
import { RoleChange } from '../../domain/role-changes';

@ApiTags('Role Changes')
@ApiBearerAuth()
@Controller('role-changes')
@UseGuards(JwtAuthGuard)
export class RoleChangesController {
  constructor(private readonly roleChangesService: RoleChangesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role change record' })
  @ApiResponse({ status: 201, description: 'Role change created successfully', type: RoleChange })
  async create(@Body() createRoleChangeDto: CreateRoleChangeDto): Promise<RoleChange> {
    return this.roleChangesService.createRoleChange(createRoleChangeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all role changes with optional filters' })
  @ApiResponse({ status: 200, description: 'List of role changes', type: [RoleChange] })
  async findAll(@Query() searchDto: SearchRoleChangesDto): Promise<{ data: RoleChange[]; total: number; page: number; limit: number }> {
    return this.roleChangesService.findAll(searchDto);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get role changes for a specific user' })
  @ApiResponse({ status: 200, description: 'Paginated list of role changes for the user' })
  async findByUser(@Param('userId', ParseIntPipe) userId: number, @Query() searchDto: SearchRoleChangesDto): Promise<{ data: RoleChange[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.roleChangesService.findByUser(userId, searchDto);
  }

  @Get('by-admin/:adminId')
  @ApiOperation({ summary: 'Get role changes made by a specific admin' })
  @ApiResponse({ status: 200, description: 'Paginated list of role changes by the admin' })
  async findByAdmin(@Param('adminId', ParseIntPipe) adminId: number, @Query() searchDto: SearchRoleChangesDto): Promise<{ data: RoleChange[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.roleChangesService.findByAdmin(adminId, searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific role change by ID' })
  @ApiResponse({ status: 200, description: 'Role change details', type: RoleChange })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<RoleChange> {
    return this.roleChangesService.findById(id);
  }

  @Get('statistics/summary')
  @ApiOperation({ summary: 'Get role change statistics' })
  @ApiResponse({ status: 200, description: 'Role change statistics' })
  async getStatistics(): Promise<any> {
    return this.roleChangesService.getStatistics();
  }
}