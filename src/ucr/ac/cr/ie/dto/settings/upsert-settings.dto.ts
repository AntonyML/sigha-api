import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class UpsertSettingsDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsObject()
  @IsNotEmpty()
  settings: Record<string, unknown>;
}
