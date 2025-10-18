import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../../domain/auth/core/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../../dto/roles';
import { SuccessResponse } from '../../interfaces';

@Injectable()
export class RoleService {
    constructor(
        @Inject('RoleRepository')
        private roleRepository: Repository<Role>,
    ) { }

    /**
     * Crear un nuevo rol
     */
    async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
        const { rName } = createRoleDto;

        // Verificar que el nombre no esté en uso
        const existingRole = await this.roleRepository.findOne({
            where: { rName }
        });

        if (existingRole) {
            throw new BadRequestException('Ya existe un rol con ese nombre');
        }

        const role = new Role(0, rName); // ID se auto-genera
        return await this.roleRepository.save(role);
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
    async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findById(id);

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
        return await this.roleRepository.save(role);
    }

    /**
     * Eliminar rol
     */
    async deleteRole(id: number): Promise<SuccessResponse> {
        const role = await this.findById(id);

        // Verificar que no sea un rol del sistema
        const systemRoles = Object.values(RoleType);
        if (systemRoles.includes(role.rName as RoleType)) {
            throw new BadRequestException('No se puede eliminar un rol del sistema');
        }

        await this.roleRepository.remove(role);
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
                console.log(`Rol del sistema creado: ${roleName}`);
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
        const role = await this.findById(roleId);
        const twoFactorRequiredRoles = [
            RoleType.SUPER_ADMIN,
            RoleType.ADMIN
        ];

        return twoFactorRequiredRoles.includes(role.rName as RoleType);
    }
}