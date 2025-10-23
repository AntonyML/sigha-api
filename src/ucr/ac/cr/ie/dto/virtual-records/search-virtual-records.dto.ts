import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchVirtualRecordsDto {
    @ApiProperty({ 
        description: 'Search term to find virtual records by identification, name, or last names', 
        required: true,
        example: "María González"
    })
    @IsString({ message: 'Search term must be a string' })
    @IsNotEmpty({ message: 'Search term cannot be empty' })
    @Transform(({ value }) => value?.trim())
    search: string;
}