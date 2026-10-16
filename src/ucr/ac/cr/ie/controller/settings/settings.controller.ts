import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../services/auth/auth.service';
import { SettingsService } from '../../services/settings/settings.service';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';
import { GlobalSettingsDto, VerifyGlobalSettingsAccessDto } from '../../dto/settings/global-settings.dto';
import { Settings } from '../../domain/settings/settings.entity';
import { RoleType } from '../../domain/auth/core/role.entity';
import { Public, Roles } from '../../common/decorators';
import { GlobalSettingsStepUpGuard, RolesGuard } from '../../common/guards';
import { SupabaseStorageService } from '../../infrastructure/storage/supabase-storage.service';

const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;
const GLOBAL_SETTINGS_ROLES = [RoleType.SUPER_ADMIN, RoleType.ADMIN];

@Controller('settings')
@UseGuards(RolesGuard)
export class SettingsController {
  constructor(
    private readonly service: SettingsService,
    private readonly storage: SupabaseStorageService,
    private readonly authService: AuthService,
  ) {}

  @Post('global/verify-2fa')
  @HttpCode(200)
  @Throttle({ default: { ttl: 300_000, limit: 5 } })
  @Roles(...GLOBAL_SETTINGS_ROLES)
  async verifyGlobalSettingsAccess(
    @Body() dto: VerifyGlobalSettingsAccessDto,
    @Request() req: any,
  ): Promise<{ accessToken: string; expiresAt: string }> {
    const userId = Number(req.user?.userId ?? req.user?.id ?? req.user?.sub);
    return this.authService.createGlobalSettingsStepUpToken(userId, dto.twoFactorCode);
  }

  @Get('global')
  @Header('Cache-Control', 'no-store')
  @Roles(...GLOBAL_SETTINGS_ROLES)
  @UseGuards(GlobalSettingsStepUpGuard)
  async getGlobalSettings(): Promise<Settings> {
    return this.service.getGlobalSettings();
  }

  // Public platform identity for marketing and unauthenticated surfaces.
  // Only the two branding fields are exposed; the step-up protected record
  // keeps the rest of the global settings private.
  @Public()
  @Get('global/public')
  @Header('Cache-Control', 'public, max-age=60')
  async getPublicGlobalSettings(): Promise<{ appName: string; logoUrl: string | null }> {
    const settings = await this.service.getGlobalSettings();
    const values = settings.settings as Record<string, unknown>;
    const appName = typeof values.appName === 'string' && values.appName.trim()
      ? values.appName.trim()
      : 'SIGHA';
    const logoUrl = typeof values.logoUrl === 'string' && values.logoUrl.trim()
      ? values.logoUrl.trim()
      : null;
    return { appName, logoUrl };
  }

  @Put('global')
  @Header('Cache-Control', 'no-store')
  @Roles(...GLOBAL_SETTINGS_ROLES)
  @UseGuards(GlobalSettingsStepUpGuard)
  async updateGlobalSettings(
    @Body() dto: GlobalSettingsDto,
    @Request() req: any,
  ): Promise<Settings> {
    const saved = await this.service.upsertGlobalSettings(dto);
    const userId = Number(req.user?.userId ?? req.user?.id ?? req.user?.sub);
    await this.authService.auditGlobalSettingsChange(
      userId,
      saved.id,
      'Identidad global de la plataforma actualizada',
    );
    return saved;
  }

  @Post('global/logo')
  @Header('Cache-Control', 'no-store')
  @Roles(...GLOBAL_SETTINGS_ROLES)
  @UseGuards(GlobalSettingsStepUpGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  async uploadGlobalLogo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ logoUrl: string }> {
    return this.saveGlobalLogo(file, req);
  }

  // The legacy upload path also requires step-up and now writes the protected
  // global record, so it cannot bypass the new authorization boundary.
  @Post('general/logo')
  @Header('Cache-Control', 'no-store')
  @Roles(...GLOBAL_SETTINGS_ROLES)
  @UseGuards(GlobalSettingsStepUpGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<{ logoUrl: string }> {
    return this.saveGlobalLogo(file, req);
  }

  @Get(':category')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
  async get(@Param('category') category: string): Promise<Settings> {
    if (category === 'global') {
      throw new ForbiddenException('Usa el acceso protegido de Configuraciones Globales');
    }
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
    if (category === 'global') {
      throw new ForbiddenException('Usa el acceso protegido de Configuraciones Globales');
    }
    return this.service.upsert(category, dto);
  }

  private async saveGlobalLogo(
    file: Express.Multer.File | undefined,
    req: any,
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
      throw new BadRequestException('El archivo excede el tamaño máximo de 2MB');
    }

    const logoUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype);
    const current = await this.service.getGlobalSettings();
    const saved = await this.service.upsertGlobalSettings({
      appName: String((current.settings as Record<string, unknown>).appName || 'SIGHA'),
      logoUrl,
    });
    const userId = Number(req.user?.userId ?? req.user?.id ?? req.user?.sub);
    await this.authService.auditGlobalSettingsChange(userId, saved.id, 'Logo global de la plataforma actualizado');

    return { logoUrl };
  }
}
