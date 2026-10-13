import { IsString, IsOptional, IsDateString, MaxLength, IsArray, ValidateNested, IsBoolean, IsIn, Matches, IsNumber, Min, Max, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const ALLOWED_ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'] as const;

const MIME_BY_EXTENSION: Record<string, readonly string[]> = {
    pdf: ['application/pdf'],
    jpg: ['image/jpeg'],
    jpeg: ['image/jpeg'],
    png: ['image/png'],
};

@ValidatorConstraint({ name: 'IsAttachmentMimeConsistent', async: false })
export class IsAttachmentMimeConsistent implements ValidatorConstraintInterface {
    validate(mime: unknown, args: ValidationArguments): boolean {
        const obj = args.object as CreateNotificationAttachmentDto;
        if (typeof mime !== 'string' || typeof obj?.naFileName !== 'string') return false;
        const ext = obj.naFileName.split('.').pop()?.toLowerCase();
        if (!ext) return false;
        const allowed = MIME_BY_EXTENSION[ext];
        return !!allowed && allowed.includes(mime);
    }

    defaultMessage(): string {
        return 'El tipo MIME no coincide con la extensión del archivo (permitidos: pdf→application/pdf, jpg/jpeg→image/jpeg, png→image/png)';
    }
}

export class CreateNotificationAttachmentDto {
    @ApiProperty({
        description: 'Nombre del archivo',
        example: 'documento.pdf'
    })
    @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
    @MaxLength(150, { message: 'El nombre del archivo no puede exceder 150 caracteres' })
    @Matches(/\.(pdf|jpe?g|png)$/i, { message: 'La extensión del archivo no es válida. Permitidas: pdf, jpg, jpeg, png' })
    naFileName: string;

    @ApiProperty({
        description: 'Ruta del archivo',
        example: '/uploads/notifications/documento.pdf'
    })
    @IsString({ message: 'La ruta del archivo debe ser una cadena de texto' })
    @MaxLength(255, { message: 'La ruta del archivo no puede exceder 255 caracteres' })
    naFilePath: string;

    @ApiProperty({
        description: 'Tipo MIME del archivo',
        example: 'application/pdf'
    })
    @IsString({ message: 'El tipo MIME debe ser una cadena de texto' })
    @MaxLength(100, { message: 'El tipo MIME no puede exceder 100 caracteres' })
    @IsIn([...ALLOWED_ATTACHMENT_MIME_TYPES], { message: 'Tipo MIME no permitido. Permitidos: application/pdf, image/jpeg, image/png' })
    @Validate(IsAttachmentMimeConsistent)
    naFileMimeType: string;

    @ApiProperty({
        description: 'Tamaño del archivo en KB (máximo 5 MB = 5120 KB)',
        example: 1024
    })
    @IsNumber({}, { message: 'El tamaño del archivo debe ser un número' })
    @Min(1, { message: 'El tamaño del archivo debe ser mayor a 0 KB' })
    @Max(5120, { message: 'El tamaño del archivo no puede exceder 5120 KB (5 MB)' })
    naFileSizeKb: number;
}

export class CreateNotificationDto {
    @ApiProperty({
        description: 'Título de la notificación',
        example: 'Recordatorio de reunión'
    })
    @IsString({ message: 'El título debe ser una cadena de texto' })
    @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
    nTitle: string;

    @ApiProperty({
        description: 'Mensaje de la notificación',
        example: 'La reunión está programada para mañana a las 10:00 AM'
    })
    @IsString({ message: 'El mensaje debe ser una cadena de texto' })
    nMessage: string;

    @ApiPropertyOptional({
        description: 'Fecha de envío (ISO 8601)',
        example: '2025-10-28T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de envío debe estar en formato ISO 8601' })
    nSendDate?: string;

    @ApiPropertyOptional({
        description: 'Estado de envío',
        example: false
    })
    @IsOptional()
    @IsBoolean({ message: 'El estado de envío debe ser un booleano' })
    nSent?: boolean;

    @ApiPropertyOptional({
        description: 'Archivos adjuntos',
        type: [CreateNotificationAttachmentDto]
    })
    @IsOptional()
    @IsArray({ message: 'Los archivos adjuntos deben ser un arreglo' })
    @ValidateNested({ each: true })
    @Type(() => CreateNotificationAttachmentDto)
    attachments?: CreateNotificationAttachmentDto[];
}