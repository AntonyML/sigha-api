import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { SettingsService } from '../../services/settings/settings.service';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';
import { Settings } from '../../domain/settings/settings.entity';
import { RoleType } from '../../domain/auth/core/role.entity';
import { Roles } from '../../common/decorators';

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get(':category')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  async get(@Param('category') category: string): Promise<Settings> {
    const result = await this.service.findByCategory(category);
    if (!result) {
      throw new NotFoundException(`Settings for category '${category}' not found`);
    }
    return result;
  }

  @Put(':category')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  async upsert(
    @Param('category') category: string,
    @Body() dto: UpsertSettingsDto,
  ): Promise<Settings> {
    return this.service.upsert(category, dto);
  }
}
