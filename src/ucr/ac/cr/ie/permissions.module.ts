import { Module } from '@nestjs/common';
import { PermissionService } from './services/permissions/permission.service';
import { PermissionController } from './controller/permissions/permission.controller';
import { permissionProviders } from './repository/permissions/permission.providers';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit.module';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [PermissionController],
  providers: [PermissionService, ...permissionProviders, ...authProviders],
  exports: [PermissionService],
})
export class PermissionsModule {}
