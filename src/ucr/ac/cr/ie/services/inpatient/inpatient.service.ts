import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FacilityRoom, PatientBedAssignment } from '../../domain/inpatient';
import { CreateRoomDto, AssignBedDto } from '../../dto/inpatient';

@Injectable()
export class InpatientService {
    constructor(
        @Inject('FacilityRoomRepository')
        private readonly roomRepository: Repository<FacilityRoom>,
        @Inject('PatientBedAssignmentRepository')
        private readonly bedAssignmentRepository: Repository<PatientBedAssignment>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async createRoom(dto: CreateRoomDto): Promise<FacilityRoom> {
        const existing = await this.roomRepository.findOne({
            where: { roomNumber: dto.roomNumber }
        });
        if (existing) {
            throw new ConflictException(`Ya existe una habitación con el código ${dto.roomNumber}`);
        }

        const room = this.roomRepository.create({
            roomNumber: dto.roomNumber,
            name: dto.name,
            floorWing: dto.floorWing,
            capacity: dto.capacity ?? 1,
            isActive: dto.isActive ?? true
        });

        return this.roomRepository.save(room);
    }

    async findAllRooms(activeOnly: boolean = false): Promise<FacilityRoom[]> {
        if (activeOnly) {
            return this.roomRepository.find({
                where: { isActive: true },
                order: { roomNumber: 'ASC' }
            });
        }
        return this.roomRepository.find({ order: { roomNumber: 'ASC' } });
    }

    async findRoomById(id: number): Promise<FacilityRoom> {
        const room = await this.roomRepository.findOne({ where: { id } });
        if (!room) {
            throw new NotFoundException(`Habitación con ID ${id} no encontrada`);
        }
        return room;
    }

    async assignBed(dto: AssignBedDto): Promise<PatientBedAssignment> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const room = await this.findRoomById(dto.idRoom);
        if (!room.isActive) {
            throw new ConflictException(`La habitación ${room.roomNumber} no está activa`);
        }

        // Close previous active assignment if exists
        const currentAssignment = await this.bedAssignmentRepository.findOne({
            where: { idOlderAdult: dto.idOlderAdult, isCurrent: true }
        });

        if (currentAssignment) {
            currentAssignment.isCurrent = false;
            currentAssignment.dischargedAt = new Date();
            await this.bedAssignmentRepository.save(currentAssignment);
        }

        const newAssignment = this.bedAssignmentRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idRoom: dto.idRoom,
            bedLabel: dto.bedLabel || 'Cama 1',
            notes: dto.notes,
            isCurrent: true,
            assignedAt: new Date()
        });

        return this.bedAssignmentRepository.save(newAssignment);
    }

    async getCurrentBedAssignment(olderAdultId: number): Promise<PatientBedAssignment | null> {
        return this.bedAssignmentRepository.findOne({
            where: { idOlderAdult: olderAdultId, isCurrent: true },
            relations: ['room']
        });
    }

    async getAllCurrentAssignments(): Promise<PatientBedAssignment[]> {
        return this.bedAssignmentRepository.find({
            where: { isCurrent: true },
            relations: ['room', 'olderAdult'],
            order: { assignedAt: 'DESC' }
        });
    }
}
