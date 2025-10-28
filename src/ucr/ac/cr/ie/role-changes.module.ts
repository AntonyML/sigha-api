import { Module } from '@nestjs/common';
import { RoleChangesController } from './controller/role-changes/role-changes.controller';
import { RoleChangesService } from './services/role-changes/role-changes.service';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleChangesController],
  providers: [RoleChangesService, ...authProviders],
  exports: [RoleChangesService],
})
export class RoleChangesModule {}