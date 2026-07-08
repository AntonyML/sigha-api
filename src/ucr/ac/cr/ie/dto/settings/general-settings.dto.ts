import { IsString, IsNotEmpty, IsOptional, IsIn, Length } from 'class-validator';

export class GeneralSettingsDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  appName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['es', 'en'])
  language: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
