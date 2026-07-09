import { IsOptional, IsString, IsIn, Matches } from 'class-validator';

const FONT_VALUES = [
  'system-ui, -apple-system, sans-serif',
  'Georgia, "Times New Roman", serif',
  '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  '"Courier New", Consolas, monospace',
] as const;

export class InterfaceSettingsDto {
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: string;

  @IsOptional()
  @IsIn(['compact', 'comfortable', 'spacious'])
  density?: string;

  @IsOptional()
  @IsIn(FONT_VALUES)
  typography?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  brandColor?: string;
}
