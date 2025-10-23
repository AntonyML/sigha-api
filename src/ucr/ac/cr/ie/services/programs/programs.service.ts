import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Program, SubProgram } from '../../domain/virtual-records';

@Injectable()
export class ProgramsService {
    constructor(
        @Inject('ProgramRepository')
        private readonly programRepository: Repository<Program>,
        
        @Inject('SubProgramRepository')
        private readonly subProgramRepository: Repository<SubProgram>
    ) {}

    async getAllPrograms(): Promise<{ message: string; data: any[] }> {
        try {
            const programs = await this.programRepository.find({
                relations: ['subPrograms'],
                order: {
                    id: 'ASC'
                }
            });

            return {
                message: 'Programs retrieved successfully',
                data: programs.map(program => ({
                    id: program.id,
                    pName: program.pName,
                    createAt: program.createAt,
                    subPrograms: program.subPrograms?.map(subProgram => ({
                        id: subProgram.id,
                        spName: subProgram.spName,
                        idProgram: subProgram.idProgram
                    })) || []
                }))
            };

        } catch (error) {
            console.error('Error retrieving programs:', error);
            throw new InternalServerErrorException('Failed to retrieve programs');
        }
    }
}