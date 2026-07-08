import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { PasswordUtil } from '../../common/utils';
import {
    CreateUserDto,
    UpdateUserDto,
    ChangePasswordDto,
    RoleCompactDto,
    UserRolesResponseDto,
    PermissionCompactDto,
    UserPermissionsResponseDto,
    UserProfileFullResponseDto,
} from '../../dto/users';
import { SuccessResponse } from '../../interfaces';
import { RoleChangesService } from '../role-changes/role-changes.service';
import { UserRoleService } from '../auth/user-role.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../domain/audit';
import { LoggerService } from '../../../common/services/logger.service';

@Injectable()
export class UserService {
    constructor(
        private logger: LoggerService,
        @Inject('UserRepository')
        private userRepository: Repository<User>,
        @Inject('RoleRepository')
        private roleRepository: Repository<Role>,
        private roleChangesService: RoleChangesService,
        private userRoleService: UserRoleService,
        private auditService: AuditService,
    ) { }

    /**
     * Crear un nuevo usuario
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { uIdentification, uEmail, uPassword, roleId, ...userData } = createUserDto;

        const existingUser = await this.userRepository.findOne({
            where: [
                { uEmail },
                { uIdentification }
            ]
        });

        if (existingUser) {
            if (existingUser.uEmail === uEmail) {
                throw new BadRequestException('El email ya está en uso');
            }
            if (existingUser.uIdentification === uIdentification) {
                throw new BadRequestException('La identificación ya está en uso');
            }
        }

        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new BadRequestException('Rol no encontrado');
        }

        const passwordValidation = PasswordUtil.validatePasswordStrength(uPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(`Contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }

        const hashedPassword = await PasswordUtil.hash(uPassword);

        const user = new User(
            0,
            uIdentification,
            userData.uName,
            userData.uFLastName,
            uEmail,
            hashedPassword,
            userData.uSLastName
        );

        const savedUser = await this.userRepository.save(user);

        await this.userRoleService.assignRole(savedUser.id, roleId, undefined, true);

        try {
            await this.auditService.createDigitalRecord(
                savedUser.id,
                {
                    action: AuditAction.CREATE,
                    tableName: 'users',
                    recordId: savedUser.id,
                    description: `Usuario ${savedUser.uName} ${savedUser.uFLastName} creado`
                }
            );
        } catch (error) {
            this.logger.error('Error creating audit record for user creation', {
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: savedUser?.id,
                action: 'user_creation',
            });
        }

        return savedUser;
    }

    /**
     * Obtener todos los usuarios
     */
    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            select: {
                id: true,
                uIdentification: true,
                uName: true,
                uFLastName: true,
                uSLastName: true,
                uEmail: true,
                uEmailVerified: true,
                uIsActive: true,
                createAt: true,
            }
        });
    }

    /**
     * Obtener usuario por ID
     */
    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                uIdentification: true,
                uName: true,
                uFLastName: true,
                uSLastName: true,
                uEmail: true,
                uEmailVerified: true,
                uIsActive: true,
                createAt: true,
            }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    /**
     * Obtener usuario por email
     */
    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { uEmail: email },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

    /**
     * Actualizar usuario
     */
    async updateUser(id: number, updateUserDto: UpdateUserDto, changedBy?: number): Promise<User> {
        const user = await this.findById(id);
        const { roleId, ...userFields } = updateUserDto;

        if (roleId) {
            const currentPrimaryRole = await this.userRoleService.findPrimaryRole(id);
            const newRole = await this.roleRepository.findOne({ where: { id: roleId } });

            if (!newRole) {
                throw new BadRequestException('Rol no encontrado');
            }

            if (!currentPrimaryRole || currentPrimaryRole.id !== roleId) {
                await this.roleChangesService.createRoleChange({
                    rcOldRole: currentPrimaryRole?.rName ?? null,
                    rcNewRole: newRole.rName,
                    oldRoleId: currentPrimaryRole?.id ?? null,
                    newRoleId: roleId,
                    idUser: id,
                    changedBy,
                });

                if (currentPrimaryRole) {
                    await this.userRoleService.removeRole(id, currentPrimaryRole.id);
                }
                await this.userRoleService.assignRole(id, roleId, changedBy, true);
            }
        }

        if (userFields.uEmail && userFields.uEmail !== user.uEmail) {
            const existingUser = await this.userRepository.findOne({
                where: { uEmail: userFields.uEmail }
            });
            if (existingUser) {
                throw new BadRequestException('El email ya está en uso');
            }
        }

        Object.assign(user, userFields);

        const savedUser = await this.userRepository.save(user);

        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.UPDATE,
                tableName: 'users',
                recordId: savedUser.id,
                description: `Actualización de usuario ${savedUser.uName} ${savedUser.uFLastName}`
            }
        );

        return savedUser;
    }

    /**
     * Cambiar contraseña de usuario
     */
    async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<SuccessResponse> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'uPassword']
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const isCurrentPasswordValid = await PasswordUtil.verify(currentPassword, user.uPassword);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Contraseña actual incorrecta');
        }

        const passwordValidation = PasswordUtil.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(`Nueva contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }

        const hashedNewPassword = await PasswordUtil.hash(newPassword);
        await this.userRepository.update(userId, { uPassword: hashedNewPassword });

        await this.auditService.createDigitalRecord(
            userId,
            {
                action: AuditAction.UPDATE,
                tableName: 'users',
                recordId: userId,
                description: 'Cambio de contraseña realizado por el usuario'
            }
        );

        return { success: true };
    }

    /**
     * Activar/Desactivar usuario
     */
    async toggleUserStatus(id: number, changedBy?: number): Promise<User> {
        const user = await this.findById(id);
        user.uIsActive = !user.uIsActive;
        const savedUser = await this.userRepository.save(user);

        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.UPDATE,
                tableName: 'users',
                recordId: savedUser.id,
                description: `Usuario ${savedUser.uIsActive ? 'activado' : 'desactivado'}`
            }
        );

        return savedUser;
    }

    /**
     * Eliminar usuario (soft delete)
     */
    async deleteUser(id: number, changedBy?: number): Promise<SuccessResponse> {
        const user = await this.findById(id);
        user.uIsActive = false;
        await this.userRepository.save(user);

        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.DELETE,
                tableName: 'users',
                recordId: id,
                description: `Usuario ${user.uName} ${user.uFLastName} eliminado (soft delete)`
            }
        );

        return { success: true };
    }

    /**
     * Obtener usuarios por rol (desde user_roles)
     */
    async findByRole(roleId: number): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user_roles', 'ur', 'ur.user_id = user.id AND ur.role_id = :roleId', { roleId })
            .where('user.uIsActive = :active', { active: true })
            .select([
                'user.id',
                'user.uIdentification',
                'user.uName',
                'user.uFLastName',
                'user.uSLastName',
                'user.uEmail',
                'user.uEmailVerified',
                'user.uIsActive',
                'user.createAt',
            ])
            .getMany();
    }

    /**
     * Buscar usuarios
     */
    async searchUsers(searchTerm: string): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .where('user.uName LIKE :term OR user.uFLastName LIKE :term OR user.uEmail LIKE :term OR user.uIdentification LIKE :term', {
                term: `%${searchTerm}%`
            })
            .select([
                'user.id',
                'user.uIdentification',
                'user.uName',
                'user.uFLastName',
                'user.uSLastName',
                'user.uEmail',
                'user.uEmailVerified',
                'user.uIsActive',
                'user.createAt',
            ])
            .getMany();
    }

    /**
     * Resolver los roles efectivos de un usuario reutilizando UserRoleService.
     * Marca `isPrimary` consultando el rol primario desde la misma fuente de verdad.
     * Lanza NotFoundException si el usuario no existe.
     */
    async getUserRoles(userId: number): Promise<UserRolesResponseDto> {
        await this.findById(userId);

        const [roles, primaryRole] = await Promise.all([
            this.userRoleService.findRolesByUserId(userId),
            this.userRoleService.findPrimaryRole(userId),
        ]);

        const primaryId = primaryRole?.id ?? null;
        const compact: RoleCompactDto[] = roles.map((r) => ({
            roleId: r.id,
            roleName: r.rName,
            isPrimary: primaryId !== null && r.id === primaryId,
        }));

        return { userId, roles: compact };
    }

    /**
     * Resolver los permisos efectivos de un usuario reutilizando
     * `UserRoleService.findUserPermissions` (join user_roles ⨝ role_permissions ⨝ permissions).
     * Devuelve códigos `module:action` deduplicados.
     */
    async getUserPermissions(userId: number): Promise<UserPermissionsResponseDto> {
        await this.findById(userId);

        const permissions = await this.userRoleService.findUserPermissions(userId);
        const seen = new Set<string>();
        const compact: PermissionCompactDto[] = [];

        for (const p of permissions) {
            const code = `${p.pModule}:${p.pAction}`;
            if (seen.has(code)) continue;
            seen.add(code);
            compact.push({
                permissionId: p.id,
                code,
                description: p.pDescription,
            });
        }

        return { userId, permissions: compact };
    }

    /**
     * Perfil enriquecido: combina el snapshot del usuario con sus roles y permisos
     * efectivos. No reescribe queries — reutiliza `findById`, `getUserRoles` y
     * `getUserPermissions`.
     */
    async getUserFullProfile(userId: number): Promise<UserProfileFullResponseDto> {
        const [user, rolesResult, permissionsResult] = await Promise.all([
            this.findById(userId),
            this.getUserRoles(userId),
            this.getUserPermissions(userId),
        ]);

        return {
            user: user as unknown as Record<string, unknown>,
            roles: rolesResult.roles,
            permissions: permissionsResult.permissions,
        };
    }
}
