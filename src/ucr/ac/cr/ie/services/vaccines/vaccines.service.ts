import { Injectable, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vaccine } from '../../domain/virtual-records';
import { CreateVaccineDto } from '../../dto/vaccines';

@Injectable()
export class VaccinesService {
    constructor(
        @Inject('VaccineRepository')
        private readonly vaccineRepository: Repository<Vaccine>
    ) {}

    async createVaccine(createVaccineDto: CreateVaccineDto): Promise<{ message: string; data: Vaccine }> {
        try {
            // Check if vaccine with the same name already exists
            const existingVaccine = await this.vaccineRepository.findOne({
                where: { vName: createVaccineDto.vName }
            });

            if (existingVaccine) {
                throw new ConflictException('A vaccine with this name already exists');
            }

            // Create new vaccine
            const newVaccine = new Vaccine(
                undefined,
                createVaccineDto.vName
            );

            const savedVaccine = await this.vaccineRepository.save(newVaccine);

            return {
                message: 'Vaccine created successfully',
                data: savedVaccine
            };

        } catch (error) {
            console.error('Error creating vaccine:', error);
            
            if (error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create vaccine');
        }
    }

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