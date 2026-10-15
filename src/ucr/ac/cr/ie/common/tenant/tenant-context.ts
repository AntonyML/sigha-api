import { AsyncLocalStorage } from 'node:async_hooks';
import type { EntityManager, QueryRunner } from 'typeorm';

export interface TenantExecutionContext {
  tenantId: number;
  userId: number;
  manager: EntityManager;
  queryRunner: QueryRunner;
}

const tenantContextStorage = new AsyncLocalStorage<TenantExecutionContext>();

export function getTenantContext(): TenantExecutionContext | undefined {
  return tenantContextStorage.getStore();
}

export function runWithTenantContext<T>(
  context: TenantExecutionContext,
  callback: () => T,
): T {
  return tenantContextStorage.run(context, callback);
}

export async function applyTenantDatabaseContext(
  query: (sql: string, parameters?: unknown[]) => Promise<unknown>,
  tenantId: number,
  userId: number,
): Promise<void> {
  await query('SET LOCAL ROLE sigha_app');
  await query(
    "SELECT set_config('app.current_tenant_id', $1, true), set_config('app.current_user_id', $2, true)",
    [String(tenantId), String(userId)],
  );
}
