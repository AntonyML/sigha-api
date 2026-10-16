import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { PersonaService } from './services/core/persona.service';
import { PerfilDigitalService } from './services/core/perfil-digital.service';
import { PersonaController } from './controller/core/persona.controller';
import { PerfilDigitalController } from './controller/core/perfil-digital.controller';
import { coreProviders } from './repository/core';

@Module({
  imports: [DatabaseModule],
  controllers: [PersonaController, PerfilDigitalController],
  providers: [
    PersonaService,
    PerfilDigitalService,
    ...coreProviders,
  ],
  exports: [
    PersonaService,
    PerfilDigitalService,
    ...coreProviders,
  ],
})
export class CoreModule {}
