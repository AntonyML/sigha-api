import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OlderAdultFamily, KinshipType } from '../../domain/virtual-records';
import { CreateOlderAdultFamilyDto } from '../../dto/older-adult-family/create-older-adult-family.dto';
import { UpdateOlderAdultFamilyDto } from '../../dto/older-adult-family/update-older-adult-family.dto';

@Injectable()
export class OlderAdultFamilyService {
    constructor(
        @Inject('OlderAdultFamilyRepository')
        private readonly olderAdultFamilyRepository: Repository<OlderAdultFamily>
    ) {}

    async create(dto: CreateOlderAdultFamilyDto): Promise<{ message: string; data: OlderAdultFamily }> {
        try {
            const member = this.olderAdultFamilyRepository.create({
                pfIdentification: dto.pfIdentification,
                pfName: dto.pfName,
                pfFLastName: dto.pfFLastName,
                pfSLastName: dto.pfSLastName,
                pfPhoneNumber: dto.pfPhoneNumber,
                pfEmail: dto.pfEmail,
                pfKinship: dto.pfKinship || KinshipType.NOT_SPECIFIED,
                createAt: new Date(),
            });
            const saved = await this.olderAdultFamilyRepository.save(member);
            return { message: 'Family member created successfully', data: saved };
        } catch (error) {
            console.error('Error creating family member:', error);
            throw new InternalServerErrorException('Failed to create family member');
        }
    }

    async findAll(): Promise<{ message: string; data: OlderAdultFamily[] }> {
        try {
            const members = await this.olderAdultFamilyRepository.find({ order: { id: 'ASC' } });
            return { message: 'Family members retrieved successfully', data: members };
        } catch (error) {
            console.error('Error retrieving family members:', error);
            throw new InternalServerErrorException('Failed to retrieve family members');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: OlderAdultFamily }> {
        try {
            const member = await this.olderAdultFamilyRepository.findOne({ where: { id } });
            if (!member) throw new NotFoundException(`Family member with id ${id} not found`);
            return { message: 'Family member retrieved successfully', data: member };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving family member:', error);
            throw new InternalServerErrorException('Failed to retrieve family member');
        }
    }

    async update(id: number, dto: UpdateOlderAdultFamilyDto): Promise<{ message: string; data: OlderAdultFamily }> {
        try {
            const member = await this.olderAdultFamilyRepository.findOne({ where: { id } });
            if (!member) throw new NotFoundException(`Family member with id ${id} not found`);
            Object.assign(member, dto);
            const updated = await this.olderAdultFamilyRepository.save(member);
            return { message: 'Family member updated successfully', data: updated };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error updating family member:', error);
            throw new InternalServerErrorException('Failed to update family member');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const member = await this.olderAdultFamilyRepository.findOne({ where: { id } });
            if (!member) throw new NotFoundException(`Family member with id ${id} not found`);
            await this.olderAdultFamilyRepository.remove(member);
            return { message: 'Family member deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error deleting family member:', error);
            throw new InternalServerErrorException('Failed to delete family member');
        }
    }
}
