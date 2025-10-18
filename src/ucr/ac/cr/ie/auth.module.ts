import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
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
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: '1h' // Token de acceso de 1 hora para testing
                },
            }),
            inject: [ConfigService],
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