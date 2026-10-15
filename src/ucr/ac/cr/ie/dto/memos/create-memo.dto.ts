import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsArray,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MemoCategory, MemoStatus, MemoUrgency, MemoVisibility } from '../../domain/memos/memo.enums';

export class MemoAttachmentDto {
    @ApiProperty({ description: 'URL del archivo adjunto' })
    @IsString()
    @IsNotEmpty()
    url!: string;

    @ApiProperty({ description: 'Nombre del archivo adjunto' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiPropertyOptional({ description: 'Tamaño en bytes' })
    @IsOptional()
    @IsInt()
    size?: number;

    @ApiPropertyOptional({ description: 'Tipo MIME' })
    @IsOptional()
    @IsString()
    type?: string;
}

export class CreateMemoDto {
    @ApiProperty({ description: 'ID del adulto mayor / residente', example: 10 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    olderAdultId!: number;

    @ApiProperty({ description: 'Contenido de la nota o derivación', example: 'Se requiere valoración prioritaria...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10000)
    content!: string;

    @ApiPropertyOptional({ enum: MemoCategory, default: MemoCategory.GENERAL })
    @IsOptional()
    @IsEnum(MemoCategory)
    category?: MemoCategory = MemoCategory.GENERAL;

    @ApiPropertyOptional({ enum: MemoVisibility, default: MemoVisibility.PUBLIC })
    @IsOptional()
    @IsEnum(MemoVisibility)
    visibility?: MemoVisibility = MemoVisibility.PUBLIC;

    @ApiPropertyOptional({ enum: MemoUrgency, default: MemoUrgency.ROUTINE })
    @IsOptional()
    @IsEnum(MemoUrgency)
    urgency?: MemoUrgency = MemoUrgency.ROUTINE;

    @ApiPropertyOptional({ description: 'ID del usuario específico a notificar (@usuario)', example: 3 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    targetUserId?: number | null;

    @ApiPropertyOptional({ description: 'ID del rol o área a notificar (#área)', example: 5 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    targetRoleId?: number | null;

    @ApiPropertyOptional({ description: 'ID del memo padre en caso de ser respuesta a un hilo', example: 1 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    parentMemoId?: number | null;

    @ApiPropertyOptional({ type: [MemoAttachmentDto], description: 'Archivos adjuntos' })
    @IsOptional()
    @IsArray()
    attachments?: MemoAttachmentDto[];
}
