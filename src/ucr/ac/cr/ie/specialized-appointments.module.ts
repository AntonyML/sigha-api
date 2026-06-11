import { Module } from '@nestjs/common';
import { SpecializedAppointmentsController } from './controller/specialized-appointments/specialized-appointments.controller';
import { SpecializedAppointmentsService } from './services/specialized-appointments/specialized-appointments.service';
import { nursingProviders } from './repository/nursing';
import { DatabaseModule } from './database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [SpecializedAppointmentsController],
    providers: [
        SpecializedAppointmentsService,
        ...nursingProviders.filter(provider =>
            provider.provide === 'SpecializedAppointmentRepository'
        ),
    ],
    exports: [SpecializedAppointmentsService],
})
export class SpecializedAppointmentsModule {}
