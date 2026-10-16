import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PlatformOrganizationsService } from './platform-organizations.service';
import { OrganizationStatus, PlanTier } from '../../domain/organizations';
import { AuditAction } from '../../domain/audit';

function orgFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Hogar San Pedro',
    slug: 'hogar-san-pedro',
    logoUrl: null,
    isActive: true,
    status: OrganizationStatus.ACTIVE,
    planTier: PlanTier.BASIC,
    brandingOverrides: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  } as any;
}

describe('PlatformOrganizationsService', () => {
  let service: PlatformOrganizationsService;
  let orgRepo: any;
  let memberRepo: any;
  let auditService: any;
  let queryBuilder: any;

  beforeEach(() => {
    orgRepo = {
      find: mock(async () => []),
      findOne: mock(async () => null),
      create: mock((entity: any) => ({ ...entity })),
      save: mock(async (entity: any) => ({ id: entity.id ?? 7, ...entity })),
    };

    queryBuilder = {
      select: mock().mockReturnThis(),
      addSelect: mock().mockReturnThis(),
      groupBy: mock().mockReturnThis(),
      getRawMany: mock(async () => []),
    };

    memberRepo = {
      count: mock(async () => 0),
      createQueryBuilder: mock(() => queryBuilder),
    };

    auditService = { logAction: mock(async () => undefined) };

    service = new PlatformOrganizationsService(orgRepo, memberRepo, auditService);
  });

  it('listOrganizations: adjunta memberCount desde el conteo agrupado', async () => {
    orgRepo.find.mockResolvedValue([orgFixture({ id: 1 }), orgFixture({ id: 2 })]);
    queryBuilder.getRawMany.mockResolvedValue([{ orgId: 1, count: '3' }]);

    const result = await service.listOrganizations();

    expect(result).toHaveLength(2);
    expect(result[0].memberCount).toBe(3);
    expect(result[1].memberCount).toBe(0);
  });

  it('getOrganization: 404 cuando no existe', async () => {
    orgRepo.findOne.mockResolvedValue(null);
    await expect(service.getOrganization(99)).rejects.toThrow(NotFoundException);
  });

  it('createOrganization: deriva el slug del nombre y audita la creación', async () => {
    orgRepo.findOne.mockResolvedValue(null);

    const created = await service.createOrganization(
      { name: 'Hogar San Pedro', planTier: PlanTier.PREMIUM },
      42,
    );

    expect(orgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'hogar-san-pedro', planTier: PlanTier.PREMIUM }),
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      42,
      AuditAction.CREATE,
      'organizations',
      7,
      expect.any(String),
    );
    expect(created.slug).toBe('hogar-san-pedro');
  });

  it('createOrganization: desambigua el slug derivado cuando ya existe', async () => {
    orgRepo.findOne.mockResolvedValueOnce(orgFixture()).mockResolvedValueOnce(null);

    await service.createOrganization({ name: 'Hogar San Pedro' }, 42);

    expect(orgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'hogar-san-pedro-2' }),
    );
  });

  it('createOrganization: 409 cuando el slug explícito ya está en uso', async () => {
    orgRepo.findOne.mockResolvedValue(orgFixture());

    await expect(
      service.createOrganization({ name: 'Otra', slug: 'hogar-san-pedro' }, 42),
    ).rejects.toThrow(ConflictException);
  });

  it('updateOrganization: aplica estado, plan y branding, y audita', async () => {
    orgRepo.findOne.mockResolvedValue(orgFixture());

    const updated = await service.updateOrganization(
      1,
      {
        status: OrganizationStatus.SUSPENDED,
        planTier: PlanTier.ENTERPRISE,
        isActive: false,
        brandingOverrides: { displayName: 'San Pedro', primaryColor: '#0d6efd' },
      },
      42,
    );

    expect(updated.status).toBe(OrganizationStatus.SUSPENDED);
    expect(updated.planTier).toBe(PlanTier.ENTERPRISE);
    expect(updated.isActive).toBe(false);
    expect(updated.brandingOverrides).toEqual({
      displayName: 'San Pedro',
      primaryColor: '#0d6efd',
    });
    expect(auditService.logAction).toHaveBeenCalledWith(
      42,
      AuditAction.UPDATE,
      'organizations',
      1,
      expect.any(String),
    );
  });

  it('updateOrganization: rechaza claves desconocidas en brandingOverrides', async () => {
    orgRepo.findOne.mockResolvedValue(orgFixture());

    await expect(
      service.updateOrganization(1, { brandingOverrides: { hmac: 'x' } } as any, 42),
    ).rejects.toThrow(BadRequestException);
  });
});
