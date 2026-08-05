import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Program, SubProgram } from '../../domain/virtual-records';
import { CreateProgramDto, CreateSubProgramDto, UpdateProgramDto } from '../../dto/programs';

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
            const existingProgram = await this.programRepository.findOne({
                where: { pName: createProgramDto.pName }
            });

            if (existingProgram) {
                throw new ConflictException('A program with this name already exists');
            }

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
            const program = await this.programRepository.findOne({
                where: { id: createSubProgramDto.idProgram }
            });

            if (!program) {
                throw new NotFoundException(`Program with ID ${createSubProgramDto.idProgram} not found`);
            }

            const existingSubProgram = await this.subProgramRepository.findOne({
                where: { 
                    spName: createSubProgramDto.spName,
                    idProgram: createSubProgramDto.idProgram
                }
            });

            if (existingSubProgram) {
                throw new ConflictException('A sub-program with this name already exists for this program');
            }

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

    async getProgramById(id: number): Promise<{ message: string; data: any }> {
        try {
            const program = await this.programRepository.findOne({
                where: { id },
                relations: ['subPrograms']
            });

            if (!program) {
                throw new NotFoundException('Program not found');
            }

            return {
                message: 'Program retrieved successfully',
                data: {
                    id: program.id,
                    pName: program.pName,
                    createAt: program.createAt,
                    subPrograms: program.subPrograms?.map(subProgram => ({
                        id: subProgram.id,
                        spName: subProgram.spName,
                        idProgram: subProgram.idProgram
                    })) || []
                }
            };

        } catch (error) {
            console.error('Error retrieving program:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve program');
        }
    }

    async updateProgram(id: number, updateProgramDto: UpdateProgramDto): Promise<{ message: string; data: Program }> {
        try {
            const program = await this.programRepository.findOne({
                where: { id }
            });

            if (!program) {
                throw new NotFoundException('Program not found');
            }

            const existingProgram = await this.programRepository.findOne({
                where: { pName: updateProgramDto.pName }
            });

            if (existingProgram && existingProgram.id !== id) {
                throw new ConflictException('A program with this name already exists');
            }

            program.pName = updateProgramDto.pName;
            const updatedProgram = await this.programRepository.save(program);

            return {
                message: 'Program updated successfully',
                data: updatedProgram
            };

        } catch (error) {
            console.error('Error updating program:', error);
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update program');
        }
    }

    async deleteProgram(id: number): Promise<{ message: string }> {
        try {
            const program = await this.programRepository.findOne({
                where: { id },
                relations: ['subPrograms']
            });

            if (!program) {
                throw new NotFoundException('Program not found');
            }

            if (program.subPrograms && program.subPrograms.length > 0) {
                throw new ConflictException('Cannot delete a program that has associated sub-programs');
            }

            await this.programRepository.remove(program);

            return { message: 'Program deleted successfully' };

        } catch (error) {
            console.error('Error deleting program:', error);
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete program');
        }
    }
}