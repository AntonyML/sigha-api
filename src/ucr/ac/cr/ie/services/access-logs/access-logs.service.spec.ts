import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { runWithTenantContext } from '../../common/tenant/tenant-context';
import { AccessLogsService } from './access-logs.service';

const context = { tenantId: 42, userId: 7, manager: {} as any, queryRunner: {} as any };

describe('AccessLogsService', () => {
  let service: AccessLogsService;
  let accessRepo: any;
  let residentRepo: any;

  beforeEach(() => {
    accessRepo = {
      findAndCount: mock(async () => [[], 0]),
      create: mock((value: any) => value),
      save: mock(async (value: any) => ({ id: 100, ...value })),
    };
    residentRepo = {
      findOne: mock(async () => ({ id: 10 })),
      findBy: mock(async () => []),
    };
    service = new AccessLogsService(accessRepo, residentRepo);
  });

  it('filters history by the active tenant and visitor name', async () => {
    await runWithTenantContext(context, () => service.findAll({ visitorName: 'María' } as any));
    const options = accessRepo.findAndCount.mock.calls[0][0];
    expect(options.where.tenantId).toBe(42);
    expect(options.where.visitorName).toBeDefined();
  });

  it('requires the tenant context before reading', async () => {
    await expect(service.findAll({} as any)).rejects.toThrow(BadRequestException);
  });

  it('records an immutable visit event with tenant and actor identity', async () => {
    const result = await runWithTenantContext(context, () => service.create({
      eventType: 'visit',
      visitorName: 'María Pérez',
      occurredAt: '2026-10-14T16:00:00.000Z',
    } as any, 7));

    expect(result).toMatchObject({ tenantId: 42, eventType: 'visit', visitorName: 'María Pérez', recordedBy: 7 });
    expect(accessRepo.save).toHaveBeenCalledTimes(1);
  });

  it('rejects a resident exit without a resident and a future movement', async () => {
    await expect(runWithTenantContext(context, () => service.create({ eventType: 'exit' } as any, 7)))
      .rejects.toThrow(BadRequestException);
    await expect(runWithTenantContext(context, () => service.create({
      eventType: 'return', residentId: 10, occurredAt: '2999-01-01T00:00:00.000Z',
    } as any, 7))).rejects.toThrow(BadRequestException);
  });
});
