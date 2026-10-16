import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { BadRequestException } from '@nestjs/common';
import { runWithTenantContext } from '../../common/tenant/tenant-context';
import { CarePlanningService } from './care-planning.service';

const context = { tenantId: 42, userId: 7, manager: {} as any, queryRunner: {} as any };

describe('CarePlanningService', () => {
  let service: CarePlanningService;
  let programRepo: any;
  let subprogramRepo: any;
  let enrollmentRepo: any;
  let scaleRepo: any;
  let residentRepo: any;

  beforeEach(() => {
    programRepo = { find: mock(async () => []), findBy: mock(async () => []), findOne: mock(async () => ({ id: 2, isActive: true })), create: mock((value: any) => value), save: mock(async (value: any) => value) };
    subprogramRepo = { find: mock(async () => []), findBy: mock(async () => []), findOne: mock(async () => ({ id: 3, isActive: true, programId: 2 })), create: mock((value: any) => value), save: mock(async (value: any) => value) };
    enrollmentRepo = { find: mock(async () => []), findOne: mock(async () => null), create: mock((value: any) => value), save: mock(async (value: any) => value) };
    scaleRepo = { find: mock(async () => []), findOne: mock(async () => ({ id: 9, idOlderAdult: 10 })) };
    residentRepo = { find: mock(async () => []), findOne: mock(async () => ({ id: 10 })) };
    service = new CarePlanningService(programRepo, subprogramRepo, enrollmentRepo, scaleRepo, residentRepo);
  });

  it('scopes catalogue reads to the active tenant', async () => {
    await runWithTenantContext(context, () => service.getCatalog());
    expect(programRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 42, isActive: true } }));
    expect(subprogramRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 42, isActive: true } }));
  });

  it('creates an enrollment that links resident, subprogram, clinical evaluation and actor', async () => {
    const result = await runWithTenantContext(context, () => service.createEnrollment({
      residentId: 10, subprogramId: 3, scaleEvaluationId: 9, goals: 'Movilidad segura',
      startedAt: '2026-10-14T12:00:00.000Z',
    } as any, 7));
    expect(result).toMatchObject({
      tenantId: 42, idOlderAdult: 10, subprogramId: 3, scaleEvaluationId: 9,
      goals: 'Movilidad segura', status: 'active', createdBy: 7,
    });
    expect(scaleRepo.findOne).toHaveBeenCalledWith({ where: { id: 9, tenantId: 42, idOlderAdult: 10 } });
  });

  it('rejects a clinical evaluation that belongs to another resident', async () => {
    scaleRepo.findOne = mock(async () => null);
    await expect(runWithTenantContext(context, () => service.createEnrollment({
      residentId: 10, subprogramId: 3, scaleEvaluationId: 99,
    } as any, 7))).rejects.toThrow(BadRequestException);
  });
});
