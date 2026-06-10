/**
 * Shared helper for the ops scripts (create-super-users, reset-database,
 * disable-2fa, etc.) to construct a TypeORM DataSource that targets
 * Postgres / Supabase.
 *
 * The connection mode follows the same rules as `src/ucr/ac/cr/ie/database.providers.ts`:
 *   - `DATABASE_URL` (Postgres URL) takes priority.
 *   - Else, fall back to the discrete `DB_*` vars.
 *   - SSL is auto-enabled when `DB_SSL=true` or when the URL contains
 *     `sslmode=require` / `ssl=true`.
 */
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export interface BuildDataSourceOptionsParams {
  entities?: Function[];
  synchronize?: boolean;
  dropSchema?: boolean;
  logging?: boolean | 'all' | Array<'query' | 'error' | 'warn' | 'info' | 'log' | 'migration'>;
}

export function buildScriptDataSourceOptions(
  params: BuildDataSourceOptionsParams = {},
): DataSourceOptions {
  const entities = params.entities ?? [];
  const useUrl = Boolean(process.env.DATABASE_URL);
  const ssl =
    process.env.DB_SSL === 'true' ||
    (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require') ||
    (process.env.DATABASE_URL || '').toLowerCase().includes('ssl=true');

  const base: DataSourceOptions = {
    type: 'postgres',
    entities,
    synchronize: params.synchronize ?? false,
    dropSchema: params.dropSchema ?? false,
    logging: params.logging ?? false,
  };

  if (useUrl) {
    return { ...base, url: process.env.DATABASE_URL, ssl: ssl ? { rejectUnauthorized: false } : false };
  }

  return {
    ...base,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hogar_de_ancianos',
    ssl: ssl ? { rejectUnauthorized: false } : false,
  };
}
