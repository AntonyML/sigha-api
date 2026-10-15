import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { runWithTenantContext } from '../../common/tenant/tenant-context';
import { SystemAuditService } from './system-audit.service';

const context = { tenantId: 42, userId: 7, manager: {} as any, queryRunner: {} as any };

describe('SystemAuditService', () => {
  let service: SystemAuditService;
  let auditRepo: any;
  let userRepo: any;

  beforeEach(() => {
    auditRepo = { findAndCount: mock(async () => [[], 0]) };
    userRepo = { findBy: mock(async () => []) };
    service = new SystemAuditService(auditRepo, userRepo);
  });

  it('scopes audit queries to the active tenant and returns a read-only page', async () => {
    const result = await runWithTenantContext(context, () => service.findAll({ tableName: 'care_programs' } as any));
    expect(auditRepo.findAndCount.mock.calls[0][0].where).toMatchObject({ tenantId: 42, tableName: 'care_programs' });
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 25 });
  });
});
