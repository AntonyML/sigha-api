import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { NotificationController } from './controller/notifications/notification.controller';
import { NotificationService } from './services/notifications/notification.service';
import { notificationProviders } from './repository/notifications/notification.providers';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit.module';

@Module({
    imports: [
        DatabaseModule, 
        AuditModule,
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                ttl: configService.get<number>('CACHE_TTL_NOTIFICATIONS') || 15000, // 15s default for notifications
                max: 200,
                isGlobal: false,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [NotificationController],
    providers: [
        ...notificationProviders,
        NotificationService,
    ],
    exports: [NotificationService],
})
export class NotificationsModule { }