import { Module } from '@nestjs/common';
import { NotifuseController } from './controller/notifuse/notifuse.controller';
import { NotifuseService } from './services/notifuse/notifuse.service';
import { AuditModule } from './audit.module';
import { NotifuseHttpService } from './services/notifuse/notifuse-http.service';

@Module({
  imports: [AuditModule],
  controllers: [NotifuseController],
  providers: [NotifuseHttpService, NotifuseService],
  exports: [NotifuseService],
})
export class NotifuseModule {}
