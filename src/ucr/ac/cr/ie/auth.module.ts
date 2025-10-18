import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controller/auth/auth.controller';
import { authProviders } from './repository/auth/auth.providers';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        ...authProviders,
    ],
    exports: [AuthService, JwtModule, ...authProviders],
})
export class AuthModule { }