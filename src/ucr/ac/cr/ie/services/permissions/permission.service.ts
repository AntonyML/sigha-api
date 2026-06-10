import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Inject
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission, PermissionModule, PermissionAction } from '../../domain/permissions/permission.entity';
import { RolePermission } from '../../domain/permissions/role-permission.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { CreatePermissionDto, UpdatePermissionDto, UpdateRolePermissionsDto } from '../../dto/permissions';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../domain/audit';

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepo: Repository<Permission>,
    @Inject('RolePermissionRepository')
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @Inject('RoleRepository')
    private readonly roleRepo: Repository<Role>,
    private readonly auditService: AuditService,
  ) {}

  // ───────────────────────── Permissions CRUD ─────────────────────────

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { pModule: 'ASC', pAction: 'ASC' } });
  }

  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    return permission;
  }

  async create(dto: CreatePermissionDto, actorId: number): Promise<Permission> {
    const exists = await this.permissionRepo.findOne({
      where: { pModule: dto.pModule, pAction: dto.pAction },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un permiso para el módulo "${dto.pModule}" con la acción "${dto.pAction}"`
      );
    }

    const permission = this.permissionRepo.create({
      pName: dto.pName,
      pDescription: dto.pDescription ?? '',
      pModule: dto.pModule,
      pAction: dto.pAction,
      pEnabled: dto.pEnabled ?? true,
    });

    const saved = await this.permissionRepo.save(permission);

    await this.auditService.logAction(
      actorId, AuditAction.CREATE, 'permissions', saved.id,
      `Permiso creado: ${saved.pName} (${saved.pModule}:${saved.pAction})`
    );

    return saved;
  }

  async update(id: number, dto: UpdatePermissionDto, actorId: number): Promise<Permission> {
    const permission = await this.findById(id);

    if (dto.pModule || dto.pAction) {
      const newModule = dto.pModule ?? permission.pModule;
      const newAction = dto.pAction ?? permission.pAction;
      const conflict = await this.permissionRepo.findOne({
        where: { pModule: newModule, pAction: newAction },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Ya existe un permiso para el módulo "${newModule}" con la acción "${newAction}"`
        );
      }
    }

    Object.assign(permission, {
      ...(dto.pName        !== undefined && { pName: dto.pName }),
      ...(dto.pDescription !== undefined && { pDescription: dto.pDescription }),
      ...(dto.pModule      !== undefined && { pModule: dto.pModule }),
      ...(dto.pAction      !== undefined && { pAction: dto.pAction }),
      ...(dto.pEnabled     !== undefined && { pEnabled: dto.pEnabled }),
    });

    const saved = await this.permissionRepo.save(permission);

    await this.auditService.logAction(
      actorId, AuditAction.UPDATE, 'permissions', saved.id,
      `Permiso actualizado: ${saved.pName}`
    );

    return saved;
  }

  async remove(id: number, actorId: number): Promise<void> {
    const permission = await this.findById(id);

    // Verificar que no haya rol_permissions activos antes de eliminar
    const usages = await this.rolePermissionRepo.count({ where: { permissionId: id, rpGranted: true } });
    if (usages > 0) {
      throw new BadRequestException(
        `No se puede eliminar el permiso: está asignado a ${usages} rol(es). Revoca primero las asignaciones.`
      );
    }

    await this.rolePermissionRepo.delete({ permissionId: id });
    await this.permissionRepo.remove(permission);

    await this.auditService.logAction(
      actorId, AuditAction.DELETE, 'permissions', id,
      `Permiso eliminado: ${permission.pName} (${permission.pModule}:${permission.pAction})`
    );
  }

  // ───────────────────────── Role–Permission assignments ─────────────────────────

  async getPermissionsByRole(roleId: number): Promise<RolePermission[]> {
    await this.getRoleOrFail(roleId);
    return this.rolePermissionRepo.find({
      where: { roleId },
      relations: ['permission'],
      order: { permission: { pModule: 'ASC', pAction: 'ASC' } } as any,
    });
  }

  async setRolePermissions(roleId: number, dto: UpdateRolePermissionsDto, actorId: number): Promise<RolePermission[]> {
    await this.getRoleOrFail(roleId);

    // Verificar que todos los IDs existen
    for (const pid of dto.permissionIds) {
      await this.findById(pid);
    }

    // Eliminar asignaciones actuales del rol
    await this.rolePermissionRepo.delete({ roleId });

    // Insertar nuevas
    const assignments = dto.permissionIds.map(pid =>
      this.rolePermissionRepo.create({ roleId, permissionId: pid, rpGranted: true })
    );
    const saved = await this.rolePermissionRepo.save(assignments);

    await this.auditService.logAction(
      actorId, AuditAction.UPDATE, 'role_permissions', roleId,
      `Permisos del rol ID=${roleId} actualizados (${dto.permissionIds.length} permisos)`
    );

    return this.rolePermissionRepo.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async toggleRolePermission(roleId: number, permissionId: number, granted: boolean, actorId: number): Promise<RolePermission> {
    await this.getRoleOrFail(roleId);
    await this.findById(permissionId);

    let rp = await this.rolePermissionRepo.findOne({ where: { roleId, permissionId } });
    if (!rp) {
      rp = this.rolePermissionRepo.create({ roleId, permissionId, rpGranted: granted });
    } else {
      rp.rpGranted = granted;
    }

    const saved = await this.rolePermissionRepo.save(rp);

    await this.auditService.logAction(
      actorId, AuditAction.UPDATE, 'role_permissions', saved.id,
      `Permiso ID=${permissionId} ${granted ? 'concedido' : 'revocado'} al rol ID=${roleId}`
    );

    return saved;
  }

  async hasPermission(roleId: number, module: PermissionModule, action: PermissionAction): Promise<boolean> {
    const rp = await this.rolePermissionRepo
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'p')
      .where('rp.roleId = :roleId', { roleId })
      .andWhere('p.pModule = :module', { module })
      .andWhere('p.pAction = :action', { action })
      .andWhere('rp.rpGranted = true')
      .andWhere('p.pEnabled = true')
      .getOne();

    return !!rp;
  }

  // ─────────────────────────── helpers ───────────────────────────

  private async getRoleOrFail(roleId: number): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    return role;
  }
}
