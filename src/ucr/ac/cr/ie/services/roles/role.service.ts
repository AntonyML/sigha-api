import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Role, RoleType } from '../../domain/auth/core/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../../dto/roles';
import { SuccessResponse } from '../../interfaces';
import { AuditService } from '../audit/audit.service';
import { AuditReportType, AuditAction } from '../../domain/audit';

@Injectable()
export class RoleService {
    constructor(
        @Inject('RoleRepository')
        private roleRepository: Repository<Role>,
        private auditService: AuditService,
        private configService: ConfigService,
    ) { }

    /**
     * Crear un nuevo rol
     */
    async createRole(createRoleDto: CreateRoleDto, changedBy?: number): Promise<Role> {
        const { rName } = createRoleDto;

        // Verificar que el nombre no esté en uso
        const existingRole = await this.roleRepository.findOne({
            where: { rName }
        });

        if (existingRole) {
            throw new BadRequestException('Ya existe un rol con ese nombre');
        }

        const role = new Role(0, rName); // ID se auto-genera
        const savedRole = await this.roleRepository.save(role);

        // Registrar auditoría de creación de rol
        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.CREATE,
                tableName: 'roles',
                recordId: savedRole.id,
                description: `Rol ${savedRole.rName} creado`
            }
        );

        return savedRole;
    }

    /**
     * Obtener todos los roles
     */
    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find({
            order: { rName: 'ASC' }
        });
    }

    /**
     * Obtener rol por ID
     */
    async findById(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id }
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado');
        }

        return role;
    }

    /**
     * Obtener rol por nombre
     */
    async findByName(name: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { rName: name }
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado');
        }

        return role;
    }

    /**
     * Actualizar rol
     */
    async updateRole(id: number, updateRoleDto: UpdateRoleDto, changedBy?: number): Promise<Role> {
        const role = await this.findById(id);
        const oldName = role.rName;

        // Si se está actualizando el nombre, verificar que no esté en uso
        if (updateRoleDto.rName && updateRoleDto.rName !== role.rName) {
            const existingRole = await this.roleRepository.findOne({
                where: { rName: updateRoleDto.rName }
            });
            if (existingRole) {
                throw new BadRequestException('Ya existe un rol con ese nombre');
            }
        }

        Object.assign(role, updateRoleDto);
        const savedRole = await this.roleRepository.save(role);

        // Registrar auditoría de actualización de rol
        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.UPDATE,
                tableName: 'roles',
                recordId: savedRole.id,
                description: `Actualización de rol ${savedRole.rName}`
            }
        );

        return savedRole;
    }

    /**
     * Eliminar rol
     */
    async deleteRole(id: number, changedBy?: number): Promise<SuccessResponse> {
        const role = await this.findById(id);

        // Verificar que no sea un rol del sistema
        const systemRoles = Object.values(RoleType);
        if (systemRoles.includes(role.rName as RoleType)) {
            throw new BadRequestException('No se puede eliminar un rol del sistema');
        }

        await this.roleRepository.remove(role);

        // Registrar auditoría de eliminación de rol
        await this.auditService.createDigitalRecord(
            changedBy || 1,
            {
                action: AuditAction.DELETE,
                tableName: 'roles',
                recordId: id,
                description: `Rol ${role.rName} eliminado del sistema`
            }
        );

        return { success: true };
    }

    /**
     * Inicializar roles del sistema
     */
    async initializeSystemRoles(): Promise<void> {
        const systemRoles = Object.values(RoleType);

        for (const roleName of systemRoles) {
            const existingRole = await this.roleRepository.findOne({
                where: { rName: roleName }
            });

            if (!existingRole) {
                const role = new Role(0, roleName);
                await this.roleRepository.save(role);
            }
        }
    }

    /**
     * Obtener roles administrativos
     */
    async getAdminRoles(): Promise<Role[]> {
        const adminRoleNames = [
            RoleType.SUPER_ADMIN,
            RoleType.ADMIN,
            RoleType.DIRECTOR
        ];

        return await this.roleRepository
            .createQueryBuilder('role')
            .where('role.rName IN (:...names)', { names: adminRoleNames })
            .getMany();
    }

    /**
     * Verificar si un rol tiene permisos administrativos
     */
    async isAdminRole(roleId: number): Promise<boolean> {
        const role = await this.findById(roleId);
        const adminRoleNames = [
            RoleType.SUPER_ADMIN,
            RoleType.ADMIN,
            RoleType.DIRECTOR
        ];

        return adminRoleNames.includes(role.rName as RoleType);
    }

    /**
     * Verificar si un rol requiere 2FA para operaciones sensibles
     */
    async requiresTwoFactor(roleId: number): Promise<boolean> {
        const fa2Enabled = this.configService.get<string>('FA2_ENABLED') === 'true';
        if (!fa2Enabled) {
            return false;
        }

        const role = await this.findById(roleId);
        const twoFactorRequiredRoles = [
            RoleType.SUPER_ADMIN,
            RoleType.ADMIN
        ];

        return twoFactorRequiredRoles.includes(role.rName as RoleType);
    }
}