import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoleChange } from '../../domain/role-changes';
import { CreateRoleChangeDto, SearchRoleChangesDto } from '../../dto/role-changes';

@Injectable()
export class RoleChangesService {
    constructor(
        @Inject('RoleChangeRepository')
        private roleChangeRepository: Repository<RoleChange>,
    ) { }

    /**
     * Crear un registro de cambio de rol
     */
    async createRoleChange(createDto: CreateRoleChangeDto, changedBy?: number): Promise<RoleChange> {
        const roleChange = this.roleChangeRepository.create({
            rcOldRole: createDto.rcOldRole,
            rcNewRole: createDto.rcNewRole,
            idUser: createDto.idUser,
            changedBy: changedBy || createDto.changedBy,
        });

        return await this.roleChangeRepository.save(roleChange);
    }

    /**
     * Obtener todos los cambios de roles con filtros y paginación
     */
    async findAll(searchDto: SearchRoleChangesDto): Promise<{
        data: RoleChange[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { idUser, changedBy, startDate, endDate, page = 1, limit = 10 } = searchDto;

        const queryBuilder = this.roleChangeRepository.createQueryBuilder('rc')
            .leftJoinAndSelect('rc.user', 'user')
            .leftJoinAndSelect('rc.changedByUser', 'admin')
            .orderBy('rc.changedAt', 'DESC');

        if (idUser) {
            queryBuilder.andWhere('rc.idUser = :idUser', { idUser });
        }

        if (changedBy) {
            queryBuilder.andWhere('rc.changedBy = :changedBy', { changedBy });
        }

        if (startDate) {
            queryBuilder.andWhere('rc.changedAt >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('rc.changedAt <= :endDate', { endDate });
        }

        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Obtener cambios de rol por usuario
     */
    async findByUser(userId: number, searchDto: SearchRoleChangesDto = {}): Promise<{
        data: RoleChange[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.findAll({ ...searchDto, idUser: userId });
    }

    /**
     * Obtener cambios realizados por un administrador
     */
    async findByAdmin(adminId: number, searchDto: SearchRoleChangesDto = {}): Promise<{
        data: RoleChange[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.findAll({ ...searchDto, changedBy: adminId });
    }

    /**
     * Obtener un cambio de rol por ID
     */
    async findById(id: number): Promise<RoleChange> {
        const roleChange = await this.roleChangeRepository.findOne({
            where: { id },
            relations: ['user', 'changedByUser'],
        });

        if (!roleChange) {
            throw new NotFoundException('Cambio de rol no encontrado');
        }

        return roleChange;
    }

    /**
     * Obtener estadísticas de cambios de roles
     */
    async getStatistics(startDate?: string, endDate?: string): Promise<{
        totalChanges: number;
        changesByAdmin: { adminId: number; adminName: string; count: number }[];
        changesByRole: { role: string; count: number }[];
        recentChanges: RoleChange[];
    }> {
        const queryBuilder = this.roleChangeRepository.createQueryBuilder('rc')
            .leftJoin('rc.changedByUser', 'admin')
            .leftJoin('rc.user', 'user');

        if (startDate) {
            queryBuilder.andWhere('rc.changedAt >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('rc.changedAt <= :endDate', { endDate });
        }

        // Total de cambios
        const totalChanges = await queryBuilder.getCount();

        // Cambios por administrador
        const changesByAdmin = await queryBuilder
            .select('admin.id', 'adminId')
            .addSelect('admin.u_name', 'adminName')
            .addSelect('COUNT(rc.id)', 'count')
            .groupBy('admin.id')
            .addGroupBy('admin.u_name')
            .orderBy('count', 'DESC')
            .getRawMany();

        // Cambios por rol nuevo
        const changesByRole = await queryBuilder
            .select('rc.rcNewRole', 'role')
            .addSelect('COUNT(rc.id)', 'count')
            .groupBy('rc.rcNewRole')
            .orderBy('count', 'DESC')
            .getRawMany();

        // Cambios recientes (últimos 10)
        const recentChanges = await this.roleChangeRepository.find({
            relations: ['user', 'changedByUser'],
            order: { changedAt: 'DESC' },
            take: 10,
        });

        return {
            totalChanges,
            changesByAdmin,
            changesByRole,
            recentChanges,
        };
    }
}