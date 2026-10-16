import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { BitacoraService } from './services/bitacora/bitacora.service';
import { BitacoraController } from './controller/bitacora/bitacora.controller';
import { bitacoraProviders } from './repository/bitacora';
import { coreProviders } from './repository/core';
import { authProviders } from './repository/auth';

@Module({
  imports: [DatabaseModule],
  controllers: [BitacoraController],
  providers: [
    BitacoraService,
    ...bitacoraProviders,
    ...coreProviders.filter((p) => p.provide === 'PerfilRepository'),
    ...authProviders.filter(
      (p) => p.provide === 'UserRepository' || p.provide === 'RoleRepository',
    ),
  ],
  exports: [BitacoraService],
})
export class BitacoraModule {}
