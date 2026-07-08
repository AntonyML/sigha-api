import {
  Controller, Get, Put, Post, Param, Body, NotFoundException,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from '../../services/settings/settings.service';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';
import { Settings } from '../../domain/settings/settings.entity';
import { RoleType } from '../../domain/auth/core/role.entity';
import { Roles } from '../../common/decorators';
import { SupabaseStorageService } from '../../infrastructure/storage/supabase-storage.service';

const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly service: SettingsService,
    private readonly storage: SupabaseStorageService,
  ) {}

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

  @Post('general/logo')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ logoUrl: string }> {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIMETYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo de 2MB`,
      );
    }

    const publicUrl = await this.storage.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    const existing = await this.service.findByCategory('general');
    const currentSettings = existing?.settings || {};
    await this.service.upsert('general', {
      category: 'general',
      settings: { ...currentSettings, logoUrl: publicUrl },
    });

    return { logoUrl: publicUrl };
  }
}
