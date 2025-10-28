import { Module } from '@nestjs/common';
import { UserService } from './services/users/user.service';
import { UserController } from './controller/users/user.controller';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { RoleChangesModule } from './role-changes.module';
import { AuditModule } from './audit.module';

@Module({
    imports: [DatabaseModule, RoleChangesModule, AuditModule],
    controllers: [UserController],
    providers: [
        UserService,
        ...authProviders,
    ],
    exports: [UserService],
})
export class UsersModule { }