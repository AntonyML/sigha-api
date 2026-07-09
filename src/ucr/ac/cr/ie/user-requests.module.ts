import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { EmailModule } from './email.module';
import { AuditModule } from './audit.module';
import { UserRequestsController } from './controller/user-requests';
import { UserRequestsService } from './services/user-requests';
import { UserRoleService } from './services/auth/user-role.service';
import { authProviders } from './repository/auth/auth.providers';

@Module({
  imports: [DatabaseModule, EmailModule, AuditModule],
  controllers: [UserRequestsController],
  providers: [UserRequestsService, UserRoleService, ...authProviders],
})
export class UserRequestsModule {}