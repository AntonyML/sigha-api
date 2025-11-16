import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './ucr/ac/cr/ie/database.module';
import { AuthModule } from './ucr/ac/cr/ie/auth.module';
import { UsersModule } from './ucr/ac/cr/ie/users.module';
import { RolesModule } from './ucr/ac/cr/ie/roles.module';
import { EntrancesExitsModule } from './ucr/ac/cr/ie/entrances-exits.module';
import { AuditModule } from './ucr/ac/cr/ie/audit.module';
import { VirtualRecordsModule } from './ucr/ac/cr/ie/virtual-records.module';
import { ProgramsModule } from './ucr/ac/cr/ie/programs.module';
import { ClinicalConditionsModule } from './ucr/ac/cr/ie/clinical-conditions.module';
import { VaccinesModule } from './ucr/ac/cr/ie/vaccines.module';
import { NotifuseModule } from './ucr/ac/cr/ie/notifuse.module';
import { NotificationsModule } from './ucr/ac/cr/ie/notifications.module';
import { RoleChangesModule } from './ucr/ac/cr/ie/role-changes.module';
import { AuditLogsModule } from './ucr/ac/cr/ie/modules/audit-logs/audit-logs.module';
import { AuditReportsModule } from './ucr/ac/cr/ie/modules/audit-reports/audit-reports.module';
import { SecurityAuditModule } from './ucr/ac/cr/ie/modules/security-audit/security-audit.module';
import { NursingModule } from './ucr/ac/cr/ie/nursing.module';
import { JwtAuthGuard } from './ucr/ac/cr/ie/common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    EntrancesExitsModule,
    AuditModule,
    VirtualRecordsModule,
    ProgramsModule,
    ClinicalConditionsModule,
    VaccinesModule,
    NotifuseModule,
    NotificationsModule,
    RoleChangesModule,
    AuditLogsModule,
    AuditReportsModule,
    SecurityAuditModule,
    NursingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
