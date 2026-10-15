import { describe, expect, it, mock } from 'bun:test';
import type { DataSource, QueryRunner } from 'typeorm';
import { createTenantAwareDataSource } from './tenant-aware-data-source';
import { runWithTenantContext } from './tenant-context';

describe('createTenantAwareDataSource', () => {
  it('routes every repository through the authenticated request transaction', async () => {
    const tenantRepository = { find: mock(async () => [{ id: 1 }]) };
    const baseRepository = { find: mock(async () => [{ id: 2 }]) };
    const tenantManager = {
      getRepository: mock(() => tenantRepository),
    };
    const dataSource = {
      getRepository: mock(() => baseRepository),
    } as unknown as DataSource;
    const tenantAwareDataSource = createTenantAwareDataSource(dataSource);

    const result = await runWithTenantContext(
      {
        tenantId: 7,
        userId: 11,
        manager: tenantManager as never,
        queryRunner: {} as QueryRunner,
      },
      () => tenantAwareDataSource.getRepository('roles').find(),
    );

    expect(result).toEqual([{ id: 1 }]);
    expect(tenantManager.getRepository).toHaveBeenCalledWith('roles');
    expect(tenantRepository.find).toHaveBeenCalledTimes(1);
    expect(baseRepository.find).not.toHaveBeenCalled();
  });

  it('keeps repositories on the base data source outside a tenant request', async () => {
    const baseRepository = { find: mock(async () => [{ id: 2 }]) };
    const dataSource = {
      getRepository: mock(() => baseRepository),
    } as unknown as DataSource;
    const tenantAwareDataSource = createTenantAwareDataSource(dataSource);

    const result = await tenantAwareDataSource.getRepository('roles').find();

    expect(result).toEqual([{ id: 2 }]);
    expect(baseRepository.find).toHaveBeenCalledTimes(1);
  });
});
