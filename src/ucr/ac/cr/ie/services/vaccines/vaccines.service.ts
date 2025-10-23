import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vaccine } from '../../domain/virtual-records';

@Injectable()
export class VaccinesService {
    constructor(
        @Inject('VaccineRepository')
        private readonly vaccineRepository: Repository<Vaccine>
    ) {}

    async getAllVaccines(): Promise<{ message: string; data: any[] }> {
        try {
            const vaccines = await this.vaccineRepository.find({
                order: {
                    id: 'ASC'
                }
            });

            return {
                message: 'Vaccines retrieved successfully',
                data: vaccines.map(vaccine => ({
                    id: vaccine.id,
                    vName: vaccine.vName
                }))
            };

        } catch (error) {
            console.error('Error retrieving vaccines:', error);
            throw new InternalServerErrorException('Failed to retrieve vaccines');
        }
    }
}