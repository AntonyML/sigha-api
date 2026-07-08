import { Injectable, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { LoggerService } from '../../common/services/logger.service';
import { Repository } from 'typeorm';
import { Vaccine } from '../../domain/virtual-records';
import { CreateVaccineDto } from '../../dto/vaccines';
import { sanitizeForLogging } from '../../../common/utils/logger-sanitizer';

@Injectable()
export class VaccinesService {
    constructor(
        private logger: LoggerService,
        @Inject('VaccineRepository')
        private readonly vaccineRepository: Repository<Vaccine>
    ) {}

    async createVaccine(createVaccineDto: CreateVaccineDto): Promise<{ message: string; data: Vaccine }> {
        try {
            const existingVaccine = await this.vaccineRepository.findOne({
                where: { vName: createVaccineDto.vName }
            });

            if (existingVaccine) {
                throw new ConflictException('A vaccine with this name already exists');
            }

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
            this.logger.error('creating vaccine', sanitizeForLogging({ error: error instanceof Error ? error.message : 'Unknown error', method: 'create' }));
            
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
            this.logger.error('retrieving vaccines', sanitizeForLogging({ error: error instanceof Error ? error.message : 'Unknown error', method: 'retrieve' }));
            throw new InternalServerErrorException('Failed to retrieve vaccines');
        }
    }
}