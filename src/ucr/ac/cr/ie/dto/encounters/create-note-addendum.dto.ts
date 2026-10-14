import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateNoteAddendumDto {
    @ApiProperty({ example: 1, description: 'ID del encuentro clínico ya firmado al cual se agrega la enmienda' })
    @IsNotEmpty()
    @IsInt()
    idEncounter!: number;

    @ApiProperty({ example: 22, description: 'ID del autor de la enmienda' })
    @IsNotEmpty()
    @IsInt()
    authorId!: number;

    @ApiProperty({ example: 'Se aclara que la dosis inicial de analgésico debe administrarse con alimentos.', description: 'Texto del addendum/enmienda' })
    @IsNotEmpty()
    @IsString()
    addendumText!: string;

    @ApiProperty({ example: 'Aclaración de pauta de administración post-firma', description: 'Motivo o justificación de la enmienda' })
    @IsNotEmpty()
    @IsString()
    reasonForAddendum!: string;
}
