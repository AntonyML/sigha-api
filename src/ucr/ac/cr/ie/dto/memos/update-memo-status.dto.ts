import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MemoStatus } from '../../domain/memos/memo.enums';

export class UpdateMemoStatusDto {
    @ApiProperty({ enum: MemoStatus, description: 'Nuevo estado del memo o caso' })
    @IsNotEmpty()
    @IsEnum(MemoStatus)
    status!: MemoStatus;
}
