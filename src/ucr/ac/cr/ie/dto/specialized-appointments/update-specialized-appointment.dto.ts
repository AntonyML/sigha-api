import { PartialType } from '@nestjs/swagger';
import { CreateSpecializedAppointmentDto } from './create-specialized-appointment.dto';

export class UpdateSpecializedAppointmentDto extends PartialType(CreateSpecializedAppointmentDto) {}
