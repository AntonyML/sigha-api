import { Module } from '@nestjs/common';
import { UserService } from './services/users/user.service';
import { UserController } from './controller/users/user.controller';
import { authProviders } from './repository/auth/auth.providers';

@Module({
    controllers: [UserController],
    providers: [
        UserService,
        ...authProviders,
    ],
    exports: [UserService],
})
export class UsersModule { }