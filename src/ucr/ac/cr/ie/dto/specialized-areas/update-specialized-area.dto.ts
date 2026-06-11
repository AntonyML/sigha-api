import { PartialType } from '@nestjs/swagger';
import { CreateSpecializedAreaDto } from './create-specialized-area.dto';

export class UpdateSpecializedAreaDto extends PartialType(CreateSpecializedAreaDto) {}
