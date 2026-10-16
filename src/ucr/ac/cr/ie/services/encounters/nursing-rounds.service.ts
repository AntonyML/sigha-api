import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NursingRound } from '../../domain/encounters';
import type { NursingShift } from '../../domain/encounters';
import { CreateNursingRoundDto } from '../../dto/encounters';
import { getTenantContext } from '../../common/tenant/tenant-context';

@Injectable()
export class NursingRoundsService {
    constructor(
        @Inject('NursingRoundRepository')
        private readonly roundRepository: Repository<NursingRound>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async recordRound(dto: CreateNursingRoundDto, staffId: number): Promise<NursingRound> {
        if (!Number.isSafeInteger(staffId) || staffId <= 0) {
            throw new BadRequestException('Se requiere el ID del profesional autenticado');
        }
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        if (!getTenantContext()) {
            throw new BadRequestException('No se encontró el contexto de organización de la ronda');
        }
        const temporaryAbsence = await this.roundRepository.manager.query(
            `SELECT 1 FROM public.resident_stays
             WHERE id_older_adult = $1 AND status = 'temporary_absence'
             LIMIT 1`,
            [dto.idOlderAdult],
        ) as unknown[];
        if (temporaryAbsence.length > 0) {
            throw new ConflictException('No se pueden registrar rondas de planta mientras el residente está en ausencia temporal');
        }

        const round = this.roundRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idStaff: staffId,
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
