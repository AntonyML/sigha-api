import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClinicalCondition } from '../../domain/virtual-records';

@Injectable()
export class ClinicalConditionsService {
    constructor(
        @Inject('ClinicalConditionRepository')
        private readonly clinicalConditionRepository: Repository<ClinicalCondition>
    ) {}

    async getAllClinicalConditions(): Promise<{ message: string; data: any[] }> {
        try {
            const conditions = await this.clinicalConditionRepository.find({
                order: {
                    id: 'ASC'
                }
            });

            return {
                message: 'Clinical conditions retrieved successfully',
                data: conditions.map(condition => ({
                    id: condition.id,
                    ccName: condition.ccName
                }))
            };

        } catch (error) {
            console.error('Error retrieving clinical conditions:', error);
            throw new InternalServerErrorException('Failed to retrieve clinical conditions');
        }
    }
}