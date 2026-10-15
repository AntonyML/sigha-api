import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class VerifyGlobalSettingsAccessDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código 2FA debe tener 6 dígitos' })
  twoFactorCode: string;
}

export class GlobalSettingsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El nombre de la plataforma no puede estar vacío' })
  @Length(1, 100)
  appName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string | null;
}
