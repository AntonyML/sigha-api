import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Program, SubProgram } from '../../domain/virtual-records';
import { CreateProgramDto, CreateSubProgramDto } from '../../dto/programs';

@Injectable()
export class ProgramsService {
    constructor(
        @Inject('ProgramRepository')
        private readonly programRepository: Repository<Program>,
        
        @Inject('SubProgramRepository')
        private readonly subProgramRepository: Repository<SubProgram>
    ) {}

    async createProgram(createProgramDto: CreateProgramDto): Promise<{ message: string; data: Program }> {
        try {
            // Check if program with the same name already exists
            const existingProgram = await this.programRepository.findOne({
                where: { pName: createProgramDto.pName }
            });

            if (existingProgram) {
                throw new ConflictException('A program with this name already exists');
            }

            // Create new program
            const newProgram = new Program(
                undefined,
                createProgramDto.pName
            );

            const savedProgram = await this.programRepository.save(newProgram);

            return {
                message: 'Program created successfully',
                data: savedProgram
            };

        } catch (error) {
            console.error('Error creating program:', error);
            
            if (error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create program');
        }
    }

    async createSubProgram(createSubProgramDto: CreateSubProgramDto): Promise<{ message: string; data: SubProgram }> {
        try {
            // Check if the program exists
            const program = await this.programRepository.findOne({
                where: { id: createSubProgramDto.idProgram }
            });

            if (!program) {
                throw new NotFoundException(`Program with ID ${createSubProgramDto.idProgram} not found`);
            }

            // Check if sub-program with the same name already exists for this program
            const existingSubProgram = await this.subProgramRepository.findOne({
                where: { 
                    spName: createSubProgramDto.spName,
                    idProgram: createSubProgramDto.idProgram
                }
            });

            if (existingSubProgram) {
                throw new ConflictException('A sub-program with this name already exists for this program');
            }

            // Create new sub-program
            const newSubProgram = new SubProgram(
                undefined,
                createSubProgramDto.spName,
                createSubProgramDto.idProgram
            );

            const savedSubProgram = await this.subProgramRepository.save(newSubProgram);

            return {
                message: 'Sub-program created successfully',
                data: savedSubProgram
            };

        } catch (error) {
            console.error('Error creating sub-program:', error);
            
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create sub-program');
        }
    }

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