import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpecializedArea, SpecializedAreaName } from '../../domain/nursing';
import { CreateSpecializedAreaDto } from '../../dto/specialized-areas/create-specialized-area.dto';
import { UpdateSpecializedAreaDto } from '../../dto/specialized-areas/update-specialized-area.dto';

@Injectable()
export class SpecializedAreasService {
    constructor(
        @Inject('SpecializedAreaRepository')
        private readonly specializedAreaRepository: Repository<SpecializedArea>
    ) {}

    async create(dto: CreateSpecializedAreaDto): Promise<{ message: string; data: SpecializedArea }> {
        try {
            const area = this.specializedAreaRepository.create({
                saName: dto.saName || SpecializedAreaName.NOT_SPECIFIED,
                saDescription: dto.saDescription,
                saContactEmail: dto.saContactEmail,
                saContactPhone: dto.saContactPhone,
                saIsActive: dto.saIsActive !== undefined ? dto.saIsActive : true,
                idManager: dto.idManager,
                createAt: new Date(),
            });
            const saved = await this.specializedAreaRepository.save(area);
            return { message: 'Specialized area created successfully', data: saved };
        } catch (error) {
            console.error('Error creating specialized area:', error);
            throw new InternalServerErrorException('Failed to create specialized area');
        }
    }

    async findAll(onlyActive?: boolean): Promise<{ message: string; data: SpecializedArea[] }> {
        try {
            const where: any = {};
            if (onlyActive === true) where.saIsActive = true;

            const areas = await this.specializedAreaRepository.find({
                where,
                order: { id: 'ASC' },
                relations: ['manager'],
            });
            return { message: 'Specialized areas retrieved successfully', data: areas };
        } catch (error) {
            console.error('Error retrieving specialized areas:', error);
            throw new InternalServerErrorException('Failed to retrieve specialized areas');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: SpecializedArea }> {
        try {
            const area = await this.specializedAreaRepository.findOne({
                where: { id },
                relations: ['manager'],
            });
            if (!area) throw new NotFoundException(`Specialized area with id ${id} not found`);
            return { message: 'Specialized area retrieved successfully', data: area };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving specialized area:', error);
            throw new InternalServerErrorException('Failed to retrieve specialized area');
        }
    }

    async update(id: number, dto: UpdateSpecializedAreaDto): Promise<{ message: string; data: SpecializedArea }> {
        try {
            const area = await this.specializedAreaRepository.findOne({ where: { id } });
            if (!area) throw new NotFoundException(`Specialized area with id ${id} not found`);
            Object.assign(area, dto);
            const updated = await this.specializedAreaRepository.save(area);
            return { message: 'Specialized area updated successfully', data: updated };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error updating specialized area:', error);
            throw new InternalServerErrorException('Failed to update specialized area');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const area = await this.specializedAreaRepository.findOne({ where: { id } });
            if (!area) throw new NotFoundException(`Specialized area with id ${id} not found`);
            await this.specializedAreaRepository.remove(area);
            return { message: 'Specialized area deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error deleting specialized area:', error);
            throw new InternalServerErrorException('Failed to delete specialized area');
        }
    }
}
