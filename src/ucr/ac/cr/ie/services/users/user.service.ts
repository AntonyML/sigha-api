import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { PasswordUtil } from '../../common/utils';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../../dto/users';
import { SuccessResponse } from '../../interfaces';
import { RoleChangesService } from '../role-changes/role-changes.service';
import { AuditService } from '../audit/audit.service';
import { AuditReportType, AuditAction } from '../../domain/audit';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepository')
        private userRepository: Repository<User>,
        @Inject('RoleRepository')
        private roleRepository: Repository<Role>,
        private roleChangesService: RoleChangesService,
        private auditService: AuditService,
    ) { }

    /**
     * Crear un nuevo usuario
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { uIdentification, uEmail, uPassword, roleId, ...userData } = createUserDto;

        // Verificar que el email no esté en uso
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

        // Verificar que el rol existe
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new BadRequestException('Rol no encontrado');
        }

        // Validar fortaleza de contraseña
        const passwordValidation = PasswordUtil.validatePasswordStrength(uPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(`Contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }

        // Hashear contraseña
        const hashedPassword = await PasswordUtil.hash(uPassword);

        // Crear usuario
        const user = new User(
            0, // ID se auto-genera
            uIdentification,
            userData.uName,
            userData.uFLastName,
            uEmail,
            hashedPassword,
            roleId,
            userData.uSLastName
        );

        const savedUser = await this.userRepository.save(user);

        // Registrar auditoría de creación de usuario
        // Nota: Aquí no tenemos el ID del usuario que crea, asumiremos que es un admin del sistema
        await this.auditService.createDigitalRecord(
            1, // Super admin por defecto para creación inicial
            {
                action: AuditAction.CREATE,
                tableName: 'user',
                recordId: savedUser.id,
                description: `Usuario ${savedUser.uName} ${savedUser.uFLastName} creado`
            }
        );

        return savedUser;
    }

    /**
     * Obtener todos los usuarios
     */
    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            relations: ['role'],
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
                roleId: true,
                // Excluir contraseña
            }
        });
    }

    /**
     * Obtener usuario por ID
     */
    async findById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role'],
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
                roleId: true,
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
            relations: ['role'],
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

        // Si se está actualizando el rol, registrar el cambio
        if (updateUserDto.roleId && updateUserDto.roleId !== user.roleId) {
            const oldRole = await this.roleRepository.findOne({ where: { id: user.roleId } });
            const newRole = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });

            if (oldRole && newRole) {
                await this.roleChangesService.createRoleChange({
                    rcOldRole: oldRole.rName,
                    rcNewRole: newRole.rName,
                    idUser: id,
                    changedBy,
                });
            }
        }

        // Si se está actualizando el email, verificar que no esté en uso
        if (updateUserDto.uEmail && updateUserDto.uEmail !== user.uEmail) {
            const existingUser = await this.userRepository.findOne({
                where: { uEmail: updateUserDto.uEmail }
            });
            if (existingUser) {
                throw new BadRequestException('El email ya está en uso');
            }
        }

        // Si se está actualizando el rol, verificar que existe
        if (updateUserDto.roleId) {
            const role = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
            if (!role) {
                throw new BadRequestException('Rol no encontrado');
            }
        }

        // Actualizar propiedades
        Object.assign(user, updateUserDto);

        const savedUser = await this.userRepository.save(user);

        // Registrar auditoría de actualización de usuario
        await this.auditService.createDigitalRecord(
            changedBy || 1, // Usuario que hace el cambio
            {
                action: AuditAction.UPDATE,
                tableName: 'user',
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

        // Buscar usuario con contraseña
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'uPassword']
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = await PasswordUtil.verify(currentPassword, user.uPassword);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Contraseña actual incorrecta');
        }

        // Validar nueva contraseña
        const passwordValidation = PasswordUtil.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            throw new BadRequestException(`Nueva contraseña no válida: ${passwordValidation.errors.join(', ')}`);
        }

        // Hashear y actualizar contraseña
        const hashedNewPassword = await PasswordUtil.hash(newPassword);
        await this.userRepository.update(userId, { uPassword: hashedNewPassword });

        // Registrar auditoría de cambio de contraseña
        await this.auditService.createDigitalRecord(
            userId,
            {
                action: AuditAction.UPDATE,
                tableName: 'user',
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
        const oldStatus = user.uIsActive;
        user.uIsActive = !user.uIsActive;
        const savedUser = await this.userRepository.save(user);

        // Registrar auditoría de cambio de estado
        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.UPDATE,
                tableName: 'user',
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

        // Registrar auditoría de eliminación de usuario
        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.DELETE,
                tableName: 'user',
                recordId: id,
                description: `Usuario ${user.uName} ${user.uFLastName} eliminado (soft delete)`
            }
        );

        return { success: true };
    }

    /**
     * Obtener usuarios por rol
     */
    async findByRole(roleId: number): Promise<User[]> {
        return await this.userRepository.find({
            where: { roleId, uIsActive: true },
            relations: ['role'],
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
                roleId: true,
            }
        });
    }

    /**
     * Buscar usuarios
     */
    async searchUsers(searchTerm: string): Promise<User[]> {
        return await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
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
                'user.roleId',
                'role.id',
                'role.rName'
            ])
            .getMany();
    }
}