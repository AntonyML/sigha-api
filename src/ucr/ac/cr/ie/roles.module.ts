import { Module } from '@nestjs/common';
import { RoleService } from './services/roles/role.service';
import { RoleController } from './controller/roles/role.controller';
import { authProviders } from './repository/auth/auth.providers';

@Module({
    controllers: [RoleController],
    providers: [
        RoleService,
        ...authProviders,
    ],
    exports: [RoleService],
})
export class RolesModule { }