import { Module } from '@nestjs/common';
import { NotificationController } from './controller/notifications/notification.controller';
import { NotificationService } from './services/notifications/notification.service';
import { notificationProviders } from './repository/notifications/notification.providers';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit.module';

@Module({
    imports: [DatabaseModule, AuditModule],
    controllers: [NotificationController],
    providers: [
        ...notificationProviders,
        NotificationService,
    ],
    exports: [NotificationService],
})
export class NotificationsModule { }