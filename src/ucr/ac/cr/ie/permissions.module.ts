import { Module } from '@nestjs/common';
import { PermissionService } from './services/permissions/permission.service';
import { PermissionController } from './controller/permissions/permission.controller';
import { permissionProviders } from './repository/permissions/permission.providers';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit.module';
import { ModulePermissionGuard } from './common/guards/module-permission.guard';

@Module({
  imports: [DatabaseModule, AuditModule],
  controllers: [PermissionController],
  providers: [PermissionService, ModulePermissionGuard, ...permissionProviders, ...authProviders],
  exports: [PermissionService, ModulePermissionGuard],
})
export class PermissionsModule {}
