import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './common/services/logger.module';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from './config/logger.config';
import { validateEnv } from './config/environment.validation';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { EmailModule } from './ucr/ac/cr/ie/email.module';
import { NotificationsModule } from './ucr/ac/cr/ie/notifications.module';
import { RoleChangesModule } from './ucr/ac/cr/ie/role-changes.module';
import { AuditReportsModule } from './ucr/ac/cr/ie/modules/audit-reports/audit-reports.module';
import { NursingModule } from './ucr/ac/cr/ie/nursing.module';
import { PermissionsModule } from './ucr/ac/cr/ie/permissions.module';
import { SpecializedAreasModule } from './ucr/ac/cr/ie/specialized-areas.module';
import { SpecializedAppointmentsModule } from './ucr/ac/cr/ie/specialized-appointments.module';
import { ClinicalMedicationModule } from './ucr/ac/cr/ie/clinical-medication.module';
import { EmergencyContactsModule } from './ucr/ac/cr/ie/emergency-contacts.module';
import { OlderAdultFamilyModule } from './ucr/ac/cr/ie/older-adult-family.module';
import { OlderAdultUpdatesModule } from './ucr/ac/cr/ie/older-adult-updates.module';
import { IdentificationLookupModule } from './ucr/ac/cr/ie/identification-lookup.module';
import { JwtAuthGuard } from './ucr/ac/cr/ie/common/guards/jwt-auth.guard';
import { HealthController } from './health.controller';
import { SettingsModule } from './ucr/ac/cr/ie/settings.module';
import { UserRequestsModule } from './ucr/ac/cr/ie/user-requests.module';
import { OrganizationModule } from './ucr/ac/cr/ie/modules/organizations/organization.module';
import { ContactInquiryModule } from './ucr/ac/cr/ie/contact-inquiry.module';
import { PharmacyModule } from './ucr/ac/cr/ie/pharmacy.module';
import { InpatientModule } from './ucr/ac/cr/ie/inpatient.module';
import { EncountersModule } from './ucr/ac/cr/ie/encounters.module';
import { SpecialtiesModule } from './ucr/ac/cr/ie/specialties.module';
import { LifestyleModule } from './ucr/ac/cr/ie/lifestyle.module';
import { TenantGuard } from './ucr/ac/cr/ie/common/guards/tenant.guard';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { MemosModule } from './ucr/ac/cr/ie/memos.module';
import { CarePlanningModule } from './ucr/ac/cr/ie/care-planning.module';
import { AccessLogsModule } from './ucr/ac/cr/ie/access-logs.module';
import { SystemAuditModule } from './ucr/ac/cr/ie/system-audit.module';
import { PlatformModule } from './ucr/ac/cr/ie/platform.module';
import { CoreModule } from './ucr/ac/cr/ie/core.module';
import { BitacoraModule } from './ucr/ac/cr/ie/bitacora.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{
      ttl: Number(process.env.THROTTLE_TTL ?? 60000),
      limit: Number(process.env.THROTTLE_LIMIT ?? 100),
    }]),
    // Global Winston logger
    WinstonModule.forRoot(createWinstonLogger()),
    LoggerModule,
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
    EmailModule,
    NotificationsModule,
    RoleChangesModule,
    AuditReportsModule,
    NursingModule,
    PermissionsModule,
    SpecializedAreasModule,
    SpecializedAppointmentsModule,
    ClinicalMedicationModule,
    EmergencyContactsModule,
    OlderAdultFamilyModule,
    OlderAdultUpdatesModule,
    IdentificationLookupModule,
    SettingsModule,
    UserRequestsModule,
    OrganizationModule,
    ContactInquiryModule,
    PharmacyModule,
    InpatientModule,
    EncountersModule,
    SpecialtiesModule,
    LifestyleModule,
    MemosModule,
    CarePlanningModule,
    AccessLogsModule,
    SystemAuditModule,
    PlatformModule,
    CoreModule,
    BitacoraModule,
  ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
      {
        provide: APP_GUARD,
        useClass: TenantGuard,
      },
      {
        provide: APP_INTERCEPTOR,
        useClass: TenantContextInterceptor,
      },
      {
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      },
    ],
  })
export class AppModule {}
