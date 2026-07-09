import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from '../../domain/auth/core/user-role.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { User } from '../../domain/auth/core/user.entity';
import { Permission, PermissionModule, PermissionAction } from '../../domain/permissions/permission.entity';

/**
 * UserRoleService — Source of truth for user ↔ role assignment (N:M).
 * All authorization decisions flow through the user_roles bridge table.
 */
@Injectable()
export class UserRoleService {
    constructor(
        @Inject('UserRoleRepository')
        private readonly userRoleRepo: Repository<UserRole>,
        @Inject('RoleRepository')
        private readonly roleRepo: Repository<Role>,
        @Inject('UserRepository')
        private readonly userRepo: Repository<User>,
    ) {}

    /**
     * Returns the roles assigned to a user (resolved as Role entities).
     */
    async findRolesByUserId(userId: number): Promise<Role[]> {
        const assignments = await this.userRoleRepo.find({
            where: { userId },
            relations: ['role'],
        });
        return assignments
            .map(ur => ur.role)
            .filter((r): r is Role => r !== null);
    }

    /**
     * Returns the primary role (is_primary = true) for a user.
     */
    async findPrimaryRole(userId: number): Promise<Role | null> {
        const ur = await this.userRoleRepo.findOne({
            where: { userId, isPrimary: true },
            relations: ['role'],
        });
        return ur?.role ?? null;
    }

    /**
     * Returns the union of permissions granted to a user across all
     * assigned roles. A permission appears once even if multiple
     * assigned roles grant it. Permissions are deduplicated by id.
     */
    async findUserPermissions(userId: number): Promise<Permission[]> {
        const perms = await this.userRoleRepo.manager
            .createQueryBuilder()
            .select('p')
            .from(Permission, 'p')
            .innerJoin('role_permissions', 'rp', 'rp.permission_id = p.id')
            .innerJoin('user_roles', 'ur', 'ur.role_id = rp.role_id')
            .where('ur.user_id = :userId', { userId })
            .andWhere('rp.rp_granted = true')
            .andWhere('p.p_enabled = true')
            .orderBy('p.p_module')
            .addOrderBy('p.p_action')
            .getMany();
        return perms;
    }

    /**
     * Returns true if the user has at least one assignment to the given role.
     */
    async existsUserRole(userId: number, roleId: number): Promise<boolean> {
        const count = await this.userRoleRepo.count({ where: { userId, roleId } });
        return count > 0;
    }

    /**
     * Assigns a role to a user. Idempotent (returns existing if present).
     * If isPrimary=true or user has no assignments yet, marks this one primary.
     */
    async assignRole(
        userId: number,
        roleId: number,
        assignedBy?: number,
        isPrimary: boolean = false,
    ): Promise<UserRole> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        const role = await this.roleRepo.findOne({ where: { id: roleId } });
        if (!role) throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);

        if (isPrimary) {
            await this.userRoleRepo.update({ userId }, { isPrimary: false });
        }

        const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
        if (existing) {
            if (isPrimary && !existing.isPrimary) {
                existing.isPrimary = true;
                return this.userRoleRepo.save(existing);
            }
            return existing;
        }

        const hasAny = await this.userRoleRepo.count({ where: { userId } });
        const finalIsPrimary = isPrimary || hasAny === 0;

        const ur = this.userRoleRepo.create({
            userId,
            roleId,
            isPrimary: finalIsPrimary,
            assignedBy: assignedBy ?? null,
        });
        return this.userRoleRepo.save(ur);
    }

    /**
     * Removes a role from a user. No-op if the assignment does not exist.
     */
    async removeRole(userId: number, roleId: number): Promise<void> {
        const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
        if (!existing) return;
        await this.userRoleRepo.remove(existing);
    }

    /**
     * Multi-role authorization check.
     * Returns true if ANY of the given role ids owns the given module/action.
     * Empty roleIds array → false.
     */
    async hasAnyPermission(
        roleIds: number[],
        module: PermissionModule,
        action: PermissionAction,
    ): Promise<boolean> {
        if (roleIds.length === 0) return false;
        const found = await this.userRoleRepo.manager
            .createQueryBuilder()
            .select('1')
            .from('role_permissions', 'rp')
            .innerJoin('permissions', 'p', 'p.id = rp.permission_id')
            .where('rp.role_id = ANY(:roleIds)', { roleIds })
            .andWhere('rp.rp_granted = true')
            .andWhere('p.p_module = :module', { module })
            .andWhere('p.p_action = :action', { action })
            .andWhere('p.p_enabled = true')
            .limit(1)
            .getRawOne();
        return !!found;
    }

    /**
     * Returns user entities (id, uName, uFLastName, uSLastName, uEmail) whose
     * user_roles bridge assigns them any of the given role names.
     * De-duplicated by user id (DISTINCT). Ignores inactive users.
     */
    async findUsersByRoleNames(roleNames: string[]): Promise<User[]> {
        if (!roleNames || roleNames.length === 0) {
            return [];
        }
        return this.userRoleRepo.manager
            .createQueryBuilder()
            .select('DISTINCT user.id', 'id')
            .addSelect('user.uName', 'uName')
            .addSelect('user.uFLastName', 'uFLastName')
            .addSelect('user.uSLastName', 'uSLastName')
            .addSelect('user.uEmail', 'uEmail')
            .from(User, 'user')
            .innerJoin('user_roles', 'ur', 'ur.user_id = user.id')
            .innerJoin('roles', 'r', 'r.id = ur.role_id AND r.r_name IN (:...roleNames)', { roleNames })
            .where('user.uIsActive = :active', { active: true })
            .getRawMany();
    }
}
