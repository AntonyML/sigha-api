import { describe, it, expect, beforeEach, mock } from 'bun:test';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  PlatformOrganizationMembersService,
  type PlatformActor,
} from './platform-organization-members.service';
import { PlatformRole } from '../../domain/auth/core/user.entity';
import { AuditAction } from '../../domain/audit';

const OWNER: PlatformActor = { userId: 900, platformRole: PlatformRole.PLATFORM_OWNER };
const SUPPORT: PlatformActor = { userId: 901, platformRole: PlatformRole.PLATFORM_SUPPORT };

function userFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    uIdentification: '100000007',
    uName: 'Ana',
    uFLastName: 'Pérez',
    uSLastName: 'Soto',
    uEmail: 'ana@example.com',
    createAt: new Date('2026-01-05T00:00:00.000Z'),
    ...overrides,
  } as any;
}

function memberFixture(overrides: Record<string, unknown> = {}) {
  return {
    userId: 7,
    organizationId: 1,
    isPrimary: false,
    roleId: 2,
    role: { id: 2, rName: 'admin' },
    user: userFixture(),
    ...overrides,
  } as any;
}

describe('PlatformOrganizationMembersService', () => {
  let service: PlatformOrganizationMembersService;
  let orgRepo: any;
  let memberRepo: any;
  let userRepo: any;
  let roleRepo: any;
  let auditService: any;
  let dataSource: any;
  let manager: any;

  beforeEach(() => {
    orgRepo = { findOne: mock(async () => ({ id: 1, name: 'Org' })) };
    memberRepo = {
      find: mock(async () => []),
      findOne: mock(async () => null),
      create: mock((entity: any) => ({ ...entity })),
      save: mock(async (entity: any) => ({ ...entity })),
      remove: mock(async (entity: any) => entity),
    };
    userRepo = { findOne: mock(async () => userFixture()) };
    roleRepo = { findOne: mock(async () => ({ id: 2, rName: 'admin' })) };
    auditService = { logAction: mock(async () => undefined) };

    manager = {
      getRepository: mock((entity: any) => {
        if (entity?.name === 'Organization') return orgRepo;
        if (entity?.name === 'OrganizationMember') return memberRepo;
        if (entity?.name === 'User') return userRepo;
        if (entity?.name === 'Role') return roleRepo;
        return memberRepo;
      }),
    };
    dataSource = {
      transaction: mock(async (callback: (manager: any) => Promise<unknown>) =>
        callback(manager),
      ),
    };

    service = new PlatformOrganizationMembersService(
      orgRepo,
      memberRepo,
      userRepo,
      roleRepo,
      auditService,
      dataSource,
    );
  });

  it('listMembers: permite OWNER y SUPPORT y proyecta el contrato v1', async () => {
    memberRepo.find.mockResolvedValue([memberFixture()]);

    const asOwner = await service.listMembers(1, OWNER);
    const asSupport = await service.listMembers(1, SUPPORT);

    for (const result of [asOwner, asSupport]) {
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        userId: 7,
        name: 'Ana Pérez Soto',
        email: 'ana@example.com',
        roleId: 2,
        roleName: 'admin',
        isPrimary: false,
        joinedAt: new Date('2026-01-05T00:00:00.000Z'),
      });
    }
    expect(memberRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: 1 } }),
    );
  });

  it('listMembers: 403 cuando el actor no tiene rol de plataforma', async () => {
    await expect(
      service.listMembers(1, { userId: 1, platformRole: 'admin' }),
    ).rejects.toThrow(ForbiddenException);
    expect(memberRepo.find).not.toHaveBeenCalled();
  });

  it('addMember: crea con rol válido y audita CREATE fuera de la transacción', async () => {
    const created = await service.addMember(1, 7, 2, OWNER);

    expect(memberRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 7, organizationId: 1, roleId: 2 }),
    );
    expect(created).toMatchObject({ userId: 7, roleId: 2, roleName: 'admin' });
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(auditService.logAction).toHaveBeenCalledWith(
      OWNER.userId,
      AuditAction.CREATE,
      'organization_members',
      7,
      expect.any(String),
    );
  });

  it('addMember: 404 cuando falta org/usuario/rol', async () => {
    orgRepo.findOne.mockResolvedValue(null);
    await expect(service.addMember(1, 7, 2, OWNER)).rejects.toThrow(NotFoundException);

    orgRepo.findOne.mockResolvedValue({ id: 1 });
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.addMember(1, 7, 2, OWNER)).rejects.toThrow(NotFoundException);

    userRepo.findOne.mockResolvedValue(userFixture());
    roleRepo.findOne.mockResolvedValue(null);
    await expect(service.addMember(1, 7, 2, OWNER)).rejects.toThrow(NotFoundException);
    expect(auditService.logAction).not.toHaveBeenCalled();
  });

  it('addMember: 409 cuando ya es miembro y 403 cuando muta SUPPORT', async () => {
    memberRepo.findOne.mockResolvedValue(memberFixture());
    await expect(service.addMember(1, 7, 2, OWNER)).rejects.toThrow(ConflictException);
    expect(auditService.logAction).not.toHaveBeenCalled();

    await expect(service.addMember(1, 7, 2, SUPPORT)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('updateMemberRole: cambia el rol y audita UPDATE', async () => {
    memberRepo.findOne.mockResolvedValue(memberFixture());
    roleRepo.findOne.mockResolvedValue({ id: 3, rName: 'director' });

    const updated = await service.updateMemberRole(1, 7, 3, OWNER);

    expect(updated).toMatchObject({ userId: 7, roleId: 3, roleName: 'director' });
    expect(auditService.logAction).toHaveBeenCalledWith(
      OWNER.userId,
      AuditAction.UPDATE,
      'organization_members',
      7,
      expect.stringContaining('admin -> director'),
    );
  });

  it('updateMemberRole: 404 cuando no es miembro', async () => {
    memberRepo.findOne.mockResolvedValue(null);

    await expect(service.updateMemberRole(1, 7, 3, OWNER)).rejects.toThrow(
      NotFoundException,
    );
    expect(auditService.logAction).not.toHaveBeenCalled();
  });

  it('removeMember: elimina sin primaria y audita DELETE', async () => {
    memberRepo.findOne.mockResolvedValue(memberFixture({ isPrimary: false }));

    const result = await service.removeMember(1, 7, OWNER);

    expect(result).toEqual({ removed: true, promotedUserId: null });
    expect(memberRepo.remove).toHaveBeenCalledTimes(1);
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(auditService.logAction).toHaveBeenCalledWith(
      OWNER.userId,
      AuditAction.DELETE,
      'organization_members',
      7,
      expect.any(String),
    );
  });

  it('removeMember: promueve la hermana de joinedAt más antiguo en la misma transacción', async () => {
    memberRepo.findOne.mockResolvedValue(
      memberFixture({ organizationId: 1, isPrimary: true }),
    );
    memberRepo.find.mockResolvedValue([
      memberFixture({
        organizationId: 2,
        isPrimary: false,
        user: userFixture({ createAt: new Date('2026-03-01T00:00:00.000Z') }),
      }),
      memberFixture({
        organizationId: 3,
        isPrimary: false,
        user: userFixture({ createAt: new Date('2026-01-10T00:00:00.000Z') }),
      }),
    ]);

    const result = await service.removeMember(1, 7, OWNER);

    expect(result).toEqual({ removed: true, promotedUserId: 7 });
    expect(memberRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 3, isPrimary: true }),
    );
    expect(auditService.logAction).toHaveBeenCalledWith(
      OWNER.userId,
      AuditAction.DELETE,
      'organization_members',
      7,
      expect.stringContaining('primaria promovida'),
    );
  });

  it('removeMember: sin hermanas queda sin primaria y no falla', async () => {
    memberRepo.findOne.mockResolvedValue(
      memberFixture({ organizationId: 1, isPrimary: true }),
    );
    memberRepo.find.mockResolvedValue([]);

    const result = await service.removeMember(1, 7, OWNER);

    expect(result).toEqual({ removed: true, promotedUserId: null });
    expect(memberRepo.save).not.toHaveBeenCalled();
    expect(auditService.logAction).toHaveBeenCalledWith(
      OWNER.userId,
      AuditAction.DELETE,
      'organization_members',
      7,
      expect.stringContaining('sin membresía primaria'),
    );
  });
});
