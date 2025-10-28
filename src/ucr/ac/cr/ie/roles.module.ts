import { Module } from '@nestjs/common';
import { RoleService } from './services/roles/role.service';
import { RoleController } from './controller/roles/role.controller';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit.module';

@Module({
    imports: [DatabaseModule, AuditModule],
    controllers: [RoleController],
    providers: [
        RoleService,
        ...authProviders,
    ],
    exports: [RoleService],
})
export class RolesModule { }