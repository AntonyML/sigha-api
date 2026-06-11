import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OlderAdultUpdate } from '../../domain/audit';

@Injectable()
export class OlderAdultUpdatesService {
    constructor(
        @Inject('OLDER_ADULT_UPDATE_REPOSITORY')
        private readonly olderAdultUpdateRepository: Repository<OlderAdultUpdate>
    ) {}

    async findAll(olderAdultId?: number, fieldChanged?: string, changedBy?: number): Promise<{ message: string; data: OlderAdultUpdate[] }> {
        try {
            const where: any = {};
            if (olderAdultId) where.idOlderAdult = olderAdultId;
            if (fieldChanged) where.oauFieldChanged = fieldChanged;
            if (changedBy) where.changedBy = changedBy;

            const updates = await this.olderAdultUpdateRepository.find({
                where,
                order: { changedAt: 'DESC' },
                relations: ['changedByUser'],
            });
            return { message: 'Older adult updates retrieved successfully', data: updates };
        } catch (error) {
            console.error('Error retrieving older adult updates:', error);
            throw new InternalServerErrorException('Failed to retrieve older adult updates');
        }
    }

    async findByOlderAdult(olderAdultId: number): Promise<{ message: string; data: OlderAdultUpdate[] }> {
        try {
            const updates = await this.olderAdultUpdateRepository.find({
                where: { idOlderAdult: olderAdultId },
                order: { changedAt: 'DESC' },
                relations: ['changedByUser'],
            });
            return { message: 'Older adult updates retrieved successfully', data: updates };
        } catch (error) {
            console.error('Error retrieving older adult updates:', error);
            throw new InternalServerErrorException('Failed to retrieve older adult updates');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: OlderAdultUpdate }> {
        try {
            const update = await this.olderAdultUpdateRepository.findOne({
                where: { id },
                relations: ['changedByUser'],
            });
            if (!update) throw new NotFoundException(`Update record with id ${id} not found`);
            return { message: 'Update record retrieved successfully', data: update };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving update record:', error);
            throw new InternalServerErrorException('Failed to retrieve update record');
        }
    }
}
