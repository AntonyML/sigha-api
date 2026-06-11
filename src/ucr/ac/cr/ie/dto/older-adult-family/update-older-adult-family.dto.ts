import { PartialType } from '@nestjs/swagger';
import { CreateOlderAdultFamilyDto } from './create-older-adult-family.dto';

export class UpdateOlderAdultFamilyDto extends PartialType(CreateOlderAdultFamilyDto) {}
