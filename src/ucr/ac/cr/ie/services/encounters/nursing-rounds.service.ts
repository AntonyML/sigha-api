import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NursingRound, NursingShift } from '../../domain/encounters';
import { CreateNursingRoundDto } from '../../dto/encounters';

@Injectable()
export class NursingRoundsService {
    constructor(
        @Inject('NursingRoundRepository')
        private readonly roundRepository: Repository<NursingRound>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async recordRound(dto: CreateNursingRoundDto): Promise<NursingRound> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const round = this.roundRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idStaff: dto.idStaff,
            roundDate: dto.roundDate ?? new Date().toISOString().split('T')[0],
            shift: dto.shift,
            idVitalSigns: dto.idVitalSigns,
            generalCondition: dto.generalCondition,
            skinIntegrity: dto.skinIntegrity,
            nutritionHydration: dto.nutritionHydration,
            elimination: dto.elimination,
            mobilityComfort: dto.mobilityComfort,
            fallRisk: dto.fallRisk ?? 'medium',
            notes: dto.notes
        });

        return this.roundRepository.save(round);
    }

    async findByPatient(patientId: number): Promise<NursingRound[]> {
        return this.roundRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['staff', 'vitalSigns'],
            order: { roundDate: 'DESC', createdAt: 'DESC' }
        });
    }

    async findByDateAndShift(date: string, shift?: NursingShift): Promise<NursingRound[]> {
        const whereClause: any = { roundDate: date };
        if (shift) {
            whereClause.shift = shift;
        }

        return this.roundRepository.find({
            where: whereClause,
            relations: ['olderAdult', 'staff', 'vitalSigns'],
            order: { createdAt: 'DESC' }
        });
    }
}
