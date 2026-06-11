import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, MaxLength } from 'class-validator';
import { KinshipType } from '../../domain/virtual-records';

export class CreateOlderAdultFamilyDto {
    @ApiProperty({ description: 'Identification number', example: '1-2345-6789', maxLength: 20 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    pfIdentification: string;

    @ApiProperty({ description: 'First name', example: 'María', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    pfName: string;

    @ApiProperty({ description: 'First last name', example: 'González', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    pfFLastName: string;

    @ApiProperty({ description: 'Second last name', example: 'Rodríguez', maxLength: 50 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    pfSLastName: string;

    @ApiPropertyOptional({ description: 'Phone number', example: '+506 8888-1234', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    pfPhoneNumber?: string;

    @ApiPropertyOptional({ description: 'Email address', example: 'maria.gonzalez@email.com', maxLength: 256 })
    @IsOptional()
    @IsEmail()
    @MaxLength(256)
    pfEmail?: string;

    @ApiProperty({ description: 'Kinship relationship', enum: KinshipType, example: KinshipType.DAUGHTER })
    @IsEnum(KinshipType)
    pfKinship: KinshipType;
}
