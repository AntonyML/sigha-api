import { Type, plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator';

/**
 * DTO de configuración validado al arrancar la aplicación.
 *
 * Se cablea en `ConfigModule.forRoot({ validate: validateEnv })` (ver `app.module.ts`)
 * para fallar rápido con un mensaje explícito si falta una variable crítica
 * o tiene un formato inválido, en lugar de fallar en tiempo de ejecución.
 *
 * Reglas:
 * - Solo `JWT_SECRET` es estrictamente requerida (mínimo 16 caracteres).
 * - Base de datos: basta con `DATABASE_URL`, o si no con discretas `DB_HOST`/`DB_NAME`.
 * - El resto de variables tienen valores por defecto iguales a los que el código
 *   ya usa en cada sitio de lectura, por lo que la validación no cambia el
 *   comportamiento en ejecución: solo detecta errores de formato.
 */
export class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'], {
    message: 'NODE_ENV debe ser development, test o production',
  })
  NODE_ENV: string = 'development';

  @Type(() => Number)
  @IsInt({ message: 'PORT debe ser un número entero' })
  @Min(1, { message: 'PORT debe ser mayor a 0' })
  @Max(65535, { message: 'PORT debe ser menor a 65536' })
  PORT: number = 3000;

  @Type(() => Number)
  @IsInt({ message: 'THROTTLE_TTL debe ser un número entero (ms)' })
  @Min(1000, { message: 'THROTTLE_TTL debe ser al menos 1000 ms' })
  THROTTLE_TTL: number = 60000;

  @Type(() => Number)
  @IsInt({ message: 'THROTTLE_LIMIT debe ser un número entero' })
  @Min(1, { message: 'THROTTLE_LIMIT debe ser mayor a 0' })
  THROTTLE_LIMIT: number = 100;

  @IsOptional()
  @IsString({ message: 'DATABASE_URL debe ser una cadena de texto' })
  DATABASE_URL?: string;

  @ValidateIf((o) => !o.DATABASE_URL)
  @IsString({ message: 'DB_HOST debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'DB_HOST es requerido si no se define DATABASE_URL' })
  DB_HOST: string = 'localhost';

  @Type(() => Number)
  @IsInt({ message: 'DB_PORT debe ser un número entero' })
  @Min(1, { message: 'DB_PORT debe ser mayor a 0' })
  @Max(65535, { message: 'DB_PORT debe ser menor a 65536' })
  DB_PORT: number = 5432;

  @ValidateIf((o) => !o.DATABASE_URL)
  @IsString({ message: 'DB_USERNAME debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'DB_USERNAME es requerido si no se define DATABASE_URL' })
  DB_USERNAME: string = 'postgres';

  @IsOptional()
  @IsString({ message: 'DB_PASSWORD debe ser una cadena de texto' })
  DB_PASSWORD?: string;

  @ValidateIf((o) => !o.DATABASE_URL)
  @IsString({ message: 'DB_NAME debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'DB_NAME es requerido si no se define DATABASE_URL' })
  DB_NAME: string = 'hogar_de_ancianos';

  @IsIn(['true', 'false'], { message: 'DB_SSL debe ser true o false' })
  DB_SSL: string = 'false';

  @IsIn(['true', 'false'], { message: 'TYPEORM_LOGGING debe ser true o false' })
  TYPEORM_LOGGING: string = 'false';

  @IsIn(['fatal', 'error', 'warn', 'info', 'http', 'audit', 'debug', 'trace'], {
    message: 'LOG_LEVEL no es un nivel válido',
  })
  LOG_LEVEL: string = 'info';

  @IsString({ message: 'JWT_SECRET debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'JWT_SECRET es requerido' })
  @MinLength(16, { message: 'JWT_SECRET debe tener al menos 16 caracteres' })
  JWT_SECRET!: string;

  @Matches(/^\d+[smhd]$/, {
    message: 'JWT_EXPIRES_IN debe tener formato como 15m, 1h o 7d',
  })
  JWT_EXPIRES_IN: string = '1h';

  @IsIn(['true', 'false'], { message: 'FA2_ENABLED debe ser true o false' })
  FA2_ENABLED: string = 'false';

  @IsOptional()
  @IsString({ message: 'RESEND_API_KEY debe ser una cadena de texto' })
  RESEND_API_KEY?: string;

  @ValidateIf((o) => o.RESEND_FROM_EMAIL !== undefined && o.RESEND_FROM_EMAIL !== '')
  @IsEmail({}, { message: 'RESEND_FROM_EMAIL debe ser un email válido' })
  RESEND_FROM_EMAIL?: string;

  @IsOptional()
  @IsString({ message: 'RESEND_FROM_NAME debe ser una cadena de texto' })
  RESEND_FROM_NAME?: string;

  @ValidateIf((o) => o.SUPABASE_URL !== undefined && o.SUPABASE_URL !== '')
  @Matches(/^https?:\/\/.+/, { message: 'SUPABASE_URL debe ser una URL http(s) válida' })
  SUPABASE_URL?: string;

  @IsOptional()
  @IsString({ message: 'SUPABASE_SERVICE_ROLE_KEY debe ser una cadena de texto' })
  SUPABASE_SERVICE_ROLE_KEY?: string;

  @ValidateIf((o) => o.NOTIFUSE_BASE_URL !== undefined && o.NOTIFUSE_BASE_URL !== '')
  @Matches(/^https?:\/\/.+/, { message: 'NOTIFUSE_BASE_URL debe ser una URL http(s) válida' })
  NOTIFUSE_BASE_URL?: string;

  @IsOptional()
  @IsString({ message: 'NOTIFUSE_API_KEY debe ser una cadena de texto' })
  NOTIFUSE_API_KEY?: string;

  @ValidateIf((o) => o.NOTIFUSE_WORKSPACE_ID !== undefined && o.NOTIFUSE_WORKSPACE_ID !== '')
  @IsString({ message: 'NOTIFUSE_WORKSPACE_ID debe ser una cadena de texto' })
  NOTIFUSE_WORKSPACE_ID?: string;

  @Type(() => Number)
  @IsInt({ message: 'CACHE_TTL_NOTIFICATIONS debe ser un número entero (ms)' })
  @Min(1000, { message: 'CACHE_TTL_NOTIFICATIONS debe ser al menos 1000 ms' })
  CACHE_TTL_NOTIFICATIONS: number = 15000;

  @Type(() => Number)
  @IsInt({ message: 'CACHE_TTL_2FA_STATUS debe ser un número entero (ms)' })
  @Min(1000, { message: 'CACHE_TTL_2FA_STATUS debe ser al menos 1000 ms' })
  CACHE_TTL_2FA_STATUS: number = 30000;

  @IsOptional()
  @IsString({ message: 'CORS_ORIGINS debe ser una lista separada por comas' })
  CORS_ORIGINS?: string;
}

/**
 * Función `validate` de `@nestjs/config`: valida el `.env` cargado y falla
 * rápido al arrancar si hay variables críticas faltantes o con formato inválido.
 * Retorna la configuración original sin mutarla (los defaults ya viven en cada
 * sitio de lectura), por lo que no altera el comportamiento en ejecución.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('; ');
    throw new Error(`Variables de entorno inválidas: ${details}`);
  }
  return config;
}
