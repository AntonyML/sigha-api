import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Settings } from '../../domain/settings/settings.entity';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';
import { GlobalSettingsDto } from '../../dto/settings/global-settings.dto';
import { GeneralSettingsDto } from '../../dto/settings/general-settings.dto';
import { InterfaceSettingsDto } from '../../dto/settings/interface-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject('SettingsRepository')
    private readonly settingsRepo: Repository<Settings>,
  ) {}

  async findByCategory(category: string): Promise<Settings | undefined> {
    return this.settingsRepo.findOne({ where: { category } });
  }

  async getGlobalSettings(): Promise<Settings> {
    const globalSettings = await this.findByCategory('global');
    if (globalSettings) return globalSettings;

    // Read existing platform identity as a one-time compatibility fallback.
    const legacyGeneral = await this.findByCategory('general');
    const legacySettings = legacyGeneral?.settings as Record<string, unknown> | undefined;
    return {
      id: 0,
      category: 'global',
      settings: {
        appName: typeof legacySettings?.appName === 'string' ? legacySettings.appName : 'SIGHA',
        logoUrl: typeof legacySettings?.logoUrl === 'string' ? legacySettings.logoUrl : null,
      },
    } as unknown as Settings;
  }

  async upsertGlobalSettings(dto: GlobalSettingsDto): Promise<Settings> {
    const globalDto = plainToInstance(GlobalSettingsDto, dto);
    try {
      await validateOrReject(globalDto, {
        validationError: { target: false, value: false },
      });
    } catch (errors) {
      if (!Array.isArray(errors)) {
        throw new BadRequestException('Error inesperado al validar la configuración global');
      }
      const messages = errors.map((error) => Object.values(error.constraints || {}).join('; ')).join(' | ');
      throw new BadRequestException(`Validación de configuración global falló: ${messages}`);
    }

    const existing = await this.findByCategory('global');
    const current = existing ?? await this.getGlobalSettings();
    const currentSettings = current.settings as Record<string, unknown>;
    const nextSettings = {
      ...currentSettings,
      appName: globalDto.appName.trim(),
      ...(globalDto.logoUrl !== undefined ? { logoUrl: globalDto.logoUrl } : {}),
    };

    if (existing) {
      existing.settings = nextSettings;
      return this.settingsRepo.save(existing);
    }

    const created = this.settingsRepo.create({ category: 'global', settings: nextSettings } as unknown as Settings);
    return this.settingsRepo.save(created);
  }

  async upsert(category: string, dto: UpsertSettingsDto): Promise<Settings> {
    if (category === 'general') {
      const generalDto = plainToInstance(GeneralSettingsDto, dto.settings as object);
      try {
        await validateOrReject(generalDto, {
          validationError: { target: false, value: false },
        });
      } catch (errors) {
        if (!Array.isArray(errors)) {
          throw new BadRequestException(
            `Error inesperado al validar configuración general: ${errors instanceof Error ? errors.message : String(errors)}`,
          );
        }
        const messages = errors.map(
          (e) => Object.values(e.constraints || {}).join('; '),
        ).join(' | ');
        throw new BadRequestException(`Validación de configuración general falló: ${messages}`);
      }
    }

    if (category === 'interface' && dto.settings) {
      const interfaceDto = plainToInstance(InterfaceSettingsDto, dto.settings as object);
      try {
        await validateOrReject(interfaceDto, {
          validationError: { target: false, value: false },
        });
      } catch (errors) {
        if (!Array.isArray(errors)) {
          throw new BadRequestException(
            `Error inesperado al validar configuración de interfaz: ${errors instanceof Error ? errors.message : String(errors)}`,
          );
        }
        const messages = errors.map(
          (e) => Object.values(e.constraints || {}).join('; '),
        ).join(' | ');
        throw new BadRequestException(`Validación de configuración de interfaz falló: ${messages}`);
      }
    }

    const existing = await this.findByCategory(category);
    let settingsToSave = dto.settings;

    if (category === 'general') {
      // The legacy general route remains for language/timezone preferences.
      // Platform name and logo can only be changed through the step-up route.
      const sanitized = { ...dto.settings };
      const currentSettings = existing?.settings as Record<string, unknown> | undefined;
      for (const identityField of ['appName', 'logoUrl'] as const) {
        if (currentSettings && Object.prototype.hasOwnProperty.call(currentSettings, identityField)) {
          sanitized[identityField] = currentSettings[identityField];
        } else {
          delete sanitized[identityField];
        }
      }
      settingsToSave = sanitized;
    }

    if (existing) {
      existing.settings = settingsToSave;
      return this.settingsRepo.save(existing);
    }
    const newEntity = this.settingsRepo.create({
      category,
      settings: settingsToSave,
    } as Settings);
    return this.settingsRepo.save(newEntity);
  }
}
