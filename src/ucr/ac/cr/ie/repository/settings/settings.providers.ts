import { DataSource } from 'typeorm';
import { Settings } from '../../domain/settings/settings.entity';

export const settingsProviders = [
  {
    provide: 'SettingsRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Settings),
    inject: ['DataSource'],
  },
];
