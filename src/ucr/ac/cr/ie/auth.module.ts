import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controller/auth/auth.controller';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { StartupService } from './services/startup.service';

@Global()
@Module({
    imports: [
        DatabaseModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        StartupService,
        ...authProviders,
    ],
    exports: [AuthService, JwtModule, ...authProviders],
})
export class AuthModule { }