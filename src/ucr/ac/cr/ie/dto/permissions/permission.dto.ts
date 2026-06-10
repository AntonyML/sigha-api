import {
  IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional,
  MaxLength, MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionModule, PermissionAction } from '../../domain/permissions';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Ver Usuarios' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  pName: string;

  @ApiPropertyOptional({ example: 'Permite ver la lista de usuarios del sistema' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pDescription?: string;

  @ApiProperty({ enum: PermissionModule, example: PermissionModule.USERS })
  @IsEnum(PermissionModule)
  pModule: PermissionModule;

  @ApiProperty({ enum: PermissionAction, example: PermissionAction.VIEW })
  @IsEnum(PermissionAction)
  pAction: PermissionAction;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  pEnabled?: boolean;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'Ver Usuarios' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  pName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pDescription?: string;

  @ApiPropertyOptional({ enum: PermissionModule })
  @IsOptional()
  @IsEnum(PermissionModule)
  pModule?: PermissionModule;

  @ApiPropertyOptional({ enum: PermissionAction })
  @IsOptional()
  @IsEnum(PermissionAction)
  pAction?: PermissionAction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pEnabled?: boolean;
}

export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: 'Array de IDs de permisos a conceder a este rol',
    type: [Number],
    example: [1, 2, 3],
  })
  permissionIds: number[];
}
