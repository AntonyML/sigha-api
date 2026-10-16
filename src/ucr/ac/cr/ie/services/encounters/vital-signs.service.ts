import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClinicalVitalSigns } from '../../domain/encounters';
import { CreateVitalSignsDto } from '../../dto/encounters';

@Injectable()
export class VitalSignsService {
    constructor(
        @Inject('ClinicalVitalSignsRepository')
        private readonly vitalSignsRepository: Repository<ClinicalVitalSigns>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async recordVitalSigns(dto: CreateVitalSignsDto, recordedBy: number): Promise<ClinicalVitalSigns> {
        if (!Number.isSafeInteger(recordedBy) || recordedBy <= 0) {
            throw new BadRequestException('Se requiere el ID del profesional autenticado');
        }
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const vitals = this.vitalSignsRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idEncounter: dto.idEncounter,
            systolicBp: dto.systolicBp,
            diastolicBp: dto.diastolicBp,
            heartRate: dto.heartRate,
            respiratoryRate: dto.respiratoryRate,
            temperature: dto.temperature,
            spo2: dto.spo2,
            glycemia: dto.glycemia,
            painEva: dto.painEva,
            weightKg: dto.weightKg,
            heightCm: dto.heightCm,
            notes: dto.notes,
            recordedBy,
            recordedAt: new Date()
        });

        return this.vitalSignsRepository.save(vitals);
    }

    async findByPatient(patientId: number, limit: number = 50): Promise<ClinicalVitalSigns[]> {
        return this.vitalSignsRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['recordedByUser'],
            order: { recordedAt: 'DESC' },
            take: limit
        });
    }

    async findByEncounter(encounterId: number): Promise<ClinicalVitalSigns[]> {
        return this.vitalSignsRepository.find({
            where: { idEncounter: encounterId },
            relations: ['recordedByUser'],
            order: { recordedAt: 'ASC' }
        });
    }

    async getLatestByPatient(patientId: number): Promise<ClinicalVitalSigns | null> {
        return this.vitalSignsRepository.findOne({
            where: { idOlderAdult: patientId },
            relations: ['recordedByUser'],
            order: { recordedAt: 'DESC' }
        });
    }
}
