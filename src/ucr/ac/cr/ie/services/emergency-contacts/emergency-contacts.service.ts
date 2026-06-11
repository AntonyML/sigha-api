import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmergencyContact } from '../../domain/virtual-records';
import { CreateEmergencyContactDto } from '../../dto/emergency-contacts/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from '../../dto/emergency-contacts/update-emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
    constructor(
        @Inject('EmergencyContactRepository')
        private readonly emergencyContactRepository: Repository<EmergencyContact>
    ) {}

    async create(dto: CreateEmergencyContactDto): Promise<{ message: string; data: EmergencyContact }> {
        try {
            const contact = this.emergencyContactRepository.create({
                enPhoneNumber: dto.enPhoneNumber,
                idOlderAdult: dto.idOlderAdult,
                createAt: new Date(),
            });
            const saved = await this.emergencyContactRepository.save(contact);
            return { message: 'Emergency contact created successfully', data: saved };
        } catch (error) {
            console.error('Error creating emergency contact:', error);
            throw new InternalServerErrorException('Failed to create emergency contact');
        }
    }

    async findAll(): Promise<{ message: string; data: EmergencyContact[] }> {
        try {
            const contacts = await this.emergencyContactRepository.find({ order: { id: 'ASC' } });
            return { message: 'Emergency contacts retrieved successfully', data: contacts };
        } catch (error) {
            console.error('Error retrieving emergency contacts:', error);
            throw new InternalServerErrorException('Failed to retrieve emergency contacts');
        }
    }

    async findByOlderAdult(olderAdultId: number): Promise<{ message: string; data: EmergencyContact[] }> {
        try {
            const contacts = await this.emergencyContactRepository.find({
                where: { idOlderAdult: olderAdultId },
                order: { id: 'ASC' },
            });
            return { message: 'Emergency contacts retrieved successfully', data: contacts };
        } catch (error) {
            console.error('Error retrieving emergency contacts by older adult:', error);
            throw new InternalServerErrorException('Failed to retrieve emergency contacts');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: EmergencyContact }> {
        try {
            const contact = await this.emergencyContactRepository.findOne({ where: { id } });
            if (!contact) throw new NotFoundException(`Emergency contact with id ${id} not found`);
            return { message: 'Emergency contact retrieved successfully', data: contact };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving emergency contact:', error);
            throw new InternalServerErrorException('Failed to retrieve emergency contact');
        }
    }

    async update(id: number, dto: UpdateEmergencyContactDto): Promise<{ message: string; data: EmergencyContact }> {
        try {
            const contact = await this.emergencyContactRepository.findOne({ where: { id } });
            if (!contact) throw new NotFoundException(`Emergency contact with id ${id} not found`);
            Object.assign(contact, dto);
            const updated = await this.emergencyContactRepository.save(contact);
            return { message: 'Emergency contact updated successfully', data: updated };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error updating emergency contact:', error);
            throw new InternalServerErrorException('Failed to update emergency contact');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const contact = await this.emergencyContactRepository.findOne({ where: { id } });
            if (!contact) throw new NotFoundException(`Emergency contact with id ${id} not found`);
            await this.emergencyContactRepository.remove(contact);
            return { message: 'Emergency contact deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error deleting emergency contact:', error);
            throw new InternalServerErrorException('Failed to delete emergency contact');
        }
    }
}
