import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Settings } from '../../domain/settings/settings.entity';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';
import { GeneralSettingsDto } from '../../dto/settings/general-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject('SettingsRepository')
    private readonly settingsRepo: Repository<Settings>,
  ) {}

  async findByCategory(category: string): Promise<Settings | undefined> {
    return this.settingsRepo.findOne({ where: { category } });
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

    const existing = await this.findByCategory(category);
    if (existing) {
      existing.settings = dto.settings;
      return this.settingsRepo.save(existing);
    }
    const newEntity = this.settingsRepo.create({
      category,
      settings: dto.settings,
    } as Settings);
    return this.settingsRepo.save(newEntity);
  }
}
