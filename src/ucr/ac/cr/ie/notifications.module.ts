import { Module } from '@nestjs/common';
import { NotificationsController } from './controller/notifications/notifications.controller';
import { NotificationsService } from './services/notifications/notifications.service';
import { AuditModule } from './audit.module';
import { NotifuseHttpService } from './services/notifications/notifuse-http.service';

@Module({
  imports: [AuditModule],
  controllers: [NotificationsController],
  providers: [NotifuseHttpService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
