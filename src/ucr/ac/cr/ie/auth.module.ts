import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
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
                    expiresIn: '1h'
                },
            }),
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                ttl: configService.get<number>('CACHE_TTL_2FA_STATUS') || 30000, // 30s default for 2FA status
                max: 100,
                isGlobal: false,
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