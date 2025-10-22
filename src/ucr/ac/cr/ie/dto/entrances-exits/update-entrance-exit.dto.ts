import { PartialType } from '@nestjs/swagger';
import { CreateEntranceExitDto } from './create-entrance-exit.dto';

export class UpdateEntranceExitDto extends PartialType(CreateEntranceExitDto) {}