import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionManagementController } from '../../controller/session-management/session-management.controller';
import { SessionManagementService } from '../../services/session-management/session-management.service';
import { SessionManagementRepository } from '../../repository/session-management/session-management.repository';
import { UserSession } from '../../domain/session-management/user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  controllers: [SessionManagementController],
  providers: [SessionManagementService, SessionManagementRepository],
  exports: [SessionManagementService, SessionManagementRepository],
})
export class SessionManagementModule {}