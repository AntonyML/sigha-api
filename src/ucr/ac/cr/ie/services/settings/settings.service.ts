import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Settings } from '../../domain/settings/settings.entity';
import { UpsertSettingsDto } from '../../dto/settings/upsert-settings.dto';

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
