import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService, UserRoleService } from './services/auth';
import { AuthController } from './controller/auth/auth.controller';
import { authProviders } from './repository/auth/auth.providers';
import { DatabaseModule } from './database.module';
import { StartupService } from './services/startup.service';
import { EmailModule } from './email.module';
import { AuditModule } from './audit.module';

@Global()
@Module({
    imports: [
        DatabaseModule,
        EmailModule,
        AuditModule,
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
        UserRoleService,
        StartupService,
        ...authProviders,
    ],
    exports: [AuthService, UserRoleService, JwtModule, ...authProviders],
})
export class AuthModule { }