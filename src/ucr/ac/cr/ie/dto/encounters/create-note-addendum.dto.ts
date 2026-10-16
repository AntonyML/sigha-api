import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteAddendumDto {
    @ApiProperty({ example: 'Se aclara que la dosis inicial de analgésico debe administrarse con alimentos.', description: 'Texto del addendum/enmienda' })
    @IsNotEmpty()
    @IsString()
    addendumText!: string;

    @ApiProperty({ example: 'Aclaración de pauta de administración post-firma', description: 'Motivo o justificación de la enmienda' })
    @IsNotEmpty()
    @IsString()
    reasonForAddendum!: string;
}
