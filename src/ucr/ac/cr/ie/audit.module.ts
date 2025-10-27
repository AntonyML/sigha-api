import { Module } from '@nestjs/common';
import { AuditService } from './services/audit';
import { AuditController } from './controller/audit';
import { auditProviders } from './repository/audit';
import { AuditLogInterceptor } from './common/interceptors';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [AuditController],
    providers: [
        AuditService,
        AuditLogInterceptor,
        ...auditProviders,
    ],
    exports: [AuditService, AuditLogInterceptor],
})
export class AuditModule { } 
