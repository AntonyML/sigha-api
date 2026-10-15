import type { DataSource, EntityTarget, QueryRunner, Repository } from 'typeorm';
import { applyTenantDatabaseContext, getTenantContext } from './tenant-context';

function tenantAwareQueryRunner(queryRunner: QueryRunner): QueryRunner {
  let contextInitialized = false;
  let autoTransaction = false;

  const initializeContext = async (): Promise<void> => {
    const context = getTenantContext();
    if (!context || contextInitialized) return;

    if (!queryRunner.isTransactionActive) {
      await queryRunner.startTransaction();
      autoTransaction = true;
    }
    await applyTenantDatabaseContext(
      (sql, parameters) => queryRunner.query(sql, parameters),
      context.tenantId,
      context.userId,
    );
    contextInitialized = true;
  };

  return new Proxy(queryRunner, {
    get(target, property) {
      if (property === 'startTransaction') {
        return async (...args: Parameters<QueryRunner['startTransaction']>) => {
          const result = await target.startTransaction(...args);
          autoTransaction = false;
          await initializeContext();
          return result;
        };
      }

      if (property === 'query') {
        return async (sql: string, parameters?: unknown[], useStructuredResult?: true) => {
          await initializeContext();
          try {
            const result = await target.query(sql, parameters, useStructuredResult);
            if (autoTransaction) {
              await target.commitTransaction();
              autoTransaction = false;
              contextInitialized = false;
            }
            return result;
          } catch (error) {
            if (autoTransaction && target.isTransactionActive) {
              await target.rollbackTransaction();
              autoTransaction = false;
              contextInitialized = false;
            }
            throw error;
          }
        };
      }

      if (property === 'commitTransaction' || property === 'rollbackTransaction') {
        return async (...args: unknown[]) => {
          const result = await Reflect.apply(
            Reflect.get(target, property, target) as (...values: unknown[]) => unknown,
            target,
            args,
          );
          if (!(target as QueryRunner & { transactionDepth?: number }).transactionDepth) {
            contextInitialized = false;
            autoTransaction = false;
          }
          return result;
        };
      }

      if (property === 'release') {
        return async (...args: Parameters<QueryRunner['release']>) => {
          if (autoTransaction && target.isTransactionActive) {
            await target.rollbackTransaction();
          }
          return target.release(...args);
        };
      }

      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export function createTenantAwareDataSource(dataSource: DataSource): DataSource {
  const repositories = new Map<string | Function, Repository<unknown>>();

  const getRepository = <Entity extends object>(
    target: EntityTarget<Entity>,
  ): Repository<Entity> => {
    const key = target as string | Function;
    let repository = repositories.get(key) as Repository<Entity> | undefined;
    if (repository) return repository;

    const baseRepository = dataSource.getRepository(target);
    repository = new Proxy(baseRepository, {
      get(current, property) {
        if (property === 'manager') {
          return getTenantContext()?.manager ?? current.manager;
        }
        if (property === 'queryRunner') {
          return getTenantContext()?.queryRunner ?? current.queryRunner;
        }

        const manager = getTenantContext()?.manager;
        const routed = manager ? manager.getRepository<Entity>(target) : current;
        const value = Reflect.get(routed, property, routed);
        return typeof value === 'function' ? value.bind(routed) : value;
      },
    });
    repositories.set(key, repository as Repository<unknown>);
    return repository;
  };

  return new Proxy(dataSource, {
    get(target, property) {
      if (property === 'getRepository') return getRepository;
      if (property === 'manager') return getTenantContext()?.manager ?? target.manager;
      if (property === 'query') {
        return (sql: string, parameters?: unknown[]) => {
          const manager = getTenantContext()?.manager;
          return manager ? manager.query(sql, parameters) : target.query(sql, parameters);
        };
      }
      if (property === 'createQueryRunner') {
        return (...args: Parameters<DataSource['createQueryRunner']>) =>
          tenantAwareQueryRunner(target.createQueryRunner(...args));
      }
      if (property === 'transaction') {
        return async (...args: unknown[]) => {
          const context = getTenantContext();
          if (context) {
            const callback = args[args.length - 1] as (manager: typeof context.manager) => unknown;
            return context.manager.transaction(callback as never);
          }
          return Reflect.apply(target.transaction, target, args);
        };
      }
      if (property === 'createQueryBuilder') {
        return (...args: unknown[]) => {
          const manager = getTenantContext()?.manager;
          const source = manager ?? target;
          return Reflect.apply(
            (source as DataSource).createQueryBuilder,
            source,
            args,
          );
        };
      }

      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}
