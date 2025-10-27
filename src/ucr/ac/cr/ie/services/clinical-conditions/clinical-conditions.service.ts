import { Injectable, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClinicalCondition } from '../../domain/virtual-records';
import { CreateClinicalConditionDto } from '../../dto/clinical-conditions';

@Injectable()
export class ClinicalConditionsService {
    constructor(
        @Inject('ClinicalConditionRepository')
        private readonly clinicalConditionRepository: Repository<ClinicalCondition>
    ) {}

    async createClinicalCondition(createClinicalConditionDto: CreateClinicalConditionDto): Promise<{ message: string; data: ClinicalCondition }> {
        try {
            const existingCondition = await this.clinicalConditionRepository.findOne({
                where: { ccName: createClinicalConditionDto.ccName }
            });

            if (existingCondition) {
                throw new ConflictException('A clinical condition with this name already exists');
            }

            const newCondition = new ClinicalCondition(
                undefined,
                createClinicalConditionDto.ccName
            );

            const savedCondition = await this.clinicalConditionRepository.save(newCondition);

            return {
                message: 'Clinical condition created successfully',
                data: savedCondition
            };

        } catch (error) {
            console.error('Error creating clinical condition:', error);
            
            if (error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create clinical condition');
        }
    }

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