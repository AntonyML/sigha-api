import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  Organization,
  OrganizationMember,
} from '../../domain/organizations';
import { Role } from '../../domain/auth/core/role.entity';
import { PlatformRole, User } from '../../domain/auth/core/user.entity';
import { AuditAction } from '../../domain/audit';
import { AuditService } from '../audit/audit.service';

/** Flat, JSON-safe projection of an organization membership (contrato §6.3 v1). */
export interface PlatformOrganizationMemberResponse {
  userId: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  isPrimary: boolean;
  /** La tabla no guarda fecha de alta; v1 expone la fecha de creación del usuario. */
  joinedAt: Date;
}

export interface PlatformActor {
  userId: number;
  platformRole: PlatformRole | string | null | undefined;
}

/**
 * Gestión de membresías del plano de plataforma (contrato §6.3 CONGELADO v1).
 * Solo reachable detrás de `PlatformGuard` (+ `PlatformStepUpGuard` en
 * mutaciones). El permiso fino (GET OWNER+SUPPORT, mutaciones solo OWNER) se
 * aplica aquí con el `platformRole` del request, sin tocar guards compartidos.
 */
@Injectable()
export class PlatformOrganizationMembersService {
  constructor(
    @Inject('OrganizationRepository')
    private readonly organizationRepository: Repository<Organization>,
    @Inject('OrganizationMemberRepository')
    private readonly memberRepository: Repository<OrganizationMember>,
    @Inject('UserRepository')
    private readonly userRepository: Repository<User>,
    @Inject('RoleRepository')
    private readonly roleRepository: Repository<Role>,
    private readonly auditService: AuditService,
    @Inject('DataSource')
    private readonly dataSource: DataSource,
  ) {}

  async listMembers(
    organizationId: number,
    actor: PlatformActor,
  ): Promise<PlatformOrganizationMemberResponse[]> {
    this.assertCanRead(actor);
    await this.findOrganizationOrFail(organizationId);

    const members = await this.memberRepository.find({
      where: { organizationId },
      relations: ['role', 'user'],
      order: { userId: 'ASC' },
    });

    return members.map((member) => this.toResponse(member));
  }

  async addMember(
    organizationId: number,
    userId: number,
    roleId: number,
    actor: PlatformActor,
  ): Promise<PlatformOrganizationMemberResponse> {
    this.assertCanMutate(actor);
    this.assertPositiveId(userId, 'userId');
    this.assertPositiveId(roleId, 'roleId');

    const created = await this.dataSource.transaction(async (manager) => {
      const orgRepo = manager.getRepository(Organization);
      const memberRepo = manager.getRepository(OrganizationMember);
      const userRepo = manager.getRepository(User);
      const roleRepo = manager.getRepository(Role);

      const org = await orgRepo.findOne({ where: { id: organizationId } });
      if (!org) {
        throw new NotFoundException('Organización no encontrada');
      }

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const role = await this.findOrganizationRoleOrFail(roleRepo, roleId);

      const existing = await memberRepo.findOne({
        where: { organizationId, userId },
      });
      if (existing) {
        throw new ConflictException('El usuario ya es miembro de la organización');
      }

      const member = memberRepo.create({
        userId,
        organizationId,
        isPrimary: false,
        roleId: role.id,
      });
      const saved = await memberRepo.save(member);
      saved.role = role;
      saved.user = user;
      return saved;
    });

    const response = this.toResponse(created);
    await this.auditService.logAction(
      actor.userId,
      AuditAction.CREATE,
      'organization_members',
      userId,
      `Membresía creada desde el plano de plataforma: usuario ${userId} ` +
        `en organización ${organizationId} con rol ${response.roleName} (${response.roleId})`,
    );
    return response;
  }

  async updateMemberRole(
    organizationId: number,
    userId: number,
    roleId: number,
    actor: PlatformActor,
  ): Promise<PlatformOrganizationMemberResponse> {
    this.assertCanMutate(actor);
    this.assertPositiveId(userId, 'userId');
    this.assertPositiveId(roleId, 'roleId');

    let previousRole = '';
    const updated = await this.dataSource.transaction(async (manager) => {
      const orgRepo = manager.getRepository(Organization);
      const memberRepo = manager.getRepository(OrganizationMember);
      const roleRepo = manager.getRepository(Role);

      const org = await orgRepo.findOne({ where: { id: organizationId } });
      if (!org) {
        throw new NotFoundException('Organización no encontrada');
      }

      const role = await this.findOrganizationRoleOrFail(roleRepo, roleId);

      const member = await memberRepo.findOne({
        where: { organizationId, userId },
        relations: ['role', 'user'],
      });
      if (!member) {
        throw new NotFoundException('La membresía no existe en esta organización');
      }

      previousRole = member.role?.rName ?? `id=${member.roleId}`;
      member.roleId = role.id;
      member.role = role;
      return memberRepo.save(member);
    });

    const response = this.toResponse(updated);
    await this.auditService.logAction(
      actor.userId,
      AuditAction.UPDATE,
      'organization_members',
      userId,
      `Membresía actualizada desde el plano de plataforma: usuario ${userId} ` +
        `en organización ${organizationId} (${previousRole} -> ${response.roleName})`,
    );
    return response;
  }

  async removeMember(
    organizationId: number,
    userId: number,
    actor: PlatformActor,
  ): Promise<{ removed: true; promotedUserId: number | null }> {
    this.assertCanMutate(actor);
    this.assertPositiveId(userId, 'userId');

    const outcome = await this.dataSource.transaction(async (manager) => {
      const orgRepo = manager.getRepository(Organization);
      const memberRepo = manager.getRepository(OrganizationMember);

      const org = await orgRepo.findOne({ where: { id: organizationId } });
      if (!org) {
        throw new NotFoundException('Organización no encontrada');
      }

      const target = await memberRepo.findOne({
        where: { organizationId, userId },
        relations: ['role', 'user'],
      });
      if (!target) {
        throw new NotFoundException('La membresía no existe en esta organización');
      }

      const wasPrimary = target.isPrimary === true;
      const email = target.user?.uEmail ?? `id=${userId}`;
      await memberRepo.remove(target);

      let promotedUserId: number | null = null;
      if (wasPrimary) {
        promotedUserId = await this.promoteOldestSibling(manager, userId);
      }

      return { wasPrimary, email, promotedUserId };
    });

    let detail = '';
    if (outcome.promotedUserId !== null) {
      detail = `; primaria promovida al usuario ${outcome.promotedUserId}`;
    } else if (outcome.wasPrimary) {
      detail = '; el usuario quedó sin membresía primaria';
    }
    await this.auditService.logAction(
      actor.userId,
      AuditAction.DELETE,
      'organization_members',
      userId,
      `Membresía eliminada desde el plano de plataforma: usuario ${userId} ` +
        `(${outcome.email}) en organización ${organizationId}${detail}`,
    );
    return { removed: true, promotedUserId: outcome.promotedUserId };
  }

  private async findOrganizationOrFail(id: number): Promise<Organization> {
    this.assertPositiveId(id, 'organizationId');
    const org = await this.organizationRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }
    return org;
  }

  private async findOrganizationRoleOrFail(
    roleRepo: Repository<Role>,
    roleId: number,
  ): Promise<Role> {
    const role = await roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    if (!role.rName || typeof role.rName !== 'string') {
      throw new BadRequestException('El rol no es válido para esta organización');
    }
    return role;
  }

  private async promoteOldestSibling(
    manager: EntityManager,
    userId: number,
  ): Promise<number | null> {
    const siblings = await manager.getRepository(OrganizationMember).find({
      where: { userId },
      relations: ['user'],
    });
    if (siblings.length === 0) {
      return null;
    }

    const oldest = [...siblings].sort((a, b) => {
      const left = a.user?.createAt ? new Date(a.user.createAt).getTime() : 0;
      const right = b.user?.createAt ? new Date(b.user.createAt).getTime() : 0;
      if (left !== right) return left - right;
      return a.organizationId - b.organizationId;
    })[0];

    oldest.isPrimary = true;
    await manager.getRepository(OrganizationMember).save(oldest);
    return oldest.userId;
  }

  private assertPositiveId(value: number, field: string): void {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new BadRequestException(`${field} debe ser un entero positivo`);
    }
  }

  private assertCanRead(actor: PlatformActor): void {
    const role = actor?.platformRole;
    if (role !== PlatformRole.PLATFORM_OWNER && role !== PlatformRole.PLATFORM_SUPPORT) {
      throw new ForbiddenException(
        'Se requiere rol PLATFORM_OWNER o PLATFORM_SUPPORT para consultar membresías',
      );
    }
  }

  private assertCanMutate(actor: PlatformActor): void {
    if (!actor || !Number.isSafeInteger(actor.userId) || actor.userId <= 0) {
      throw new ForbiddenException('Actor de plataforma no válido');
    }
    if (actor.platformRole !== PlatformRole.PLATFORM_OWNER) {
      throw new ForbiddenException(
        'Solo PLATFORM_OWNER puede modificar membresías de organización',
      );
    }
  }

  private toResponse(member: OrganizationMember): PlatformOrganizationMemberResponse {
    const user = member.user;
    const fullName = user
      ? [user.uName, user.uFLastName, user.uSLastName].filter(Boolean).join(' ').trim()
      : `Usuario ${member.userId}`;
    return {
      userId: member.userId,
      name: fullName || `Usuario ${member.userId}`,
      email: user?.uEmail ?? '',
      roleId: member.roleId,
      roleName: member.role?.rName ?? '',
      isPrimary: member.isPrimary === true,
      joinedAt: user?.createAt ? new Date(user.createAt) : new Date(0),
    };
  }
}

