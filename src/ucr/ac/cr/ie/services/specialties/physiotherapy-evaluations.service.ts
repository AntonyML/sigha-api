import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { PhysiotherapyEvaluation, BarthelLevel } from '../../domain/specialties';
import { ClinicalEncounter, ClinicalScaleEvaluation } from '../../domain/encounters';
import { CreatePhysiotherapyEvaluationDto } from '../../dto/specialties';
import { persistSpecialtyScale, specialtyScaleResponse } from './specialty-encounter-persistence';

@Injectable()
export class PhysiotherapyEvaluationsService {
    constructor(
        @Inject('PhysiotherapyEvaluationRepository')
        private readonly legacyEvaluationRepository: Repository<PhysiotherapyEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
        @Inject('ClinicalEncounterRepository')
        private readonly encounterRepository: Repository<ClinicalEncounter>,
        @Inject('ClinicalScaleEvaluationRepository')
        private readonly scaleRepository: Repository<ClinicalScaleEvaluation>,
    ) {}

    calculateBarthelTotalScore(dto: CreatePhysiotherapyEvaluationDto): number {
        return dto.barthelFeeding + dto.barthelBathing + dto.barthelGrooming
            + dto.barthelDressing + dto.barthelBowels + dto.barthelBladder
            + dto.barthelToiletUse + dto.barthelTransfers + dto.barthelMobility + dto.barthelStairs;
    }

    determineDependenceLevel(score: number): BarthelLevel {
        if (score === 100) return 'independent';
        if (score >= 91) return 'mild_dependence';
        if (score >= 61) return 'moderate_dependence';
        if (score >= 21) return 'severe_dependence';
        return 'total_dependence';
    }

    async create(dto: CreatePhysiotherapyEvaluationDto, evaluatorId: number): Promise<Record<string, unknown>> {
        const olderAdult = await this.olderAdultRepository.findOne({ where: { id: dto.idOlderAdult } });
        if (!olderAdult) throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);

        const totalScore = this.calculateBarthelTotalScore(dto);
        const dependenceLevel = this.determineDependenceLevel(totalScore);
        const evaluationDate = new Date();
        const items = {
            feeding: dto.barthelFeeding,
            bathing: dto.barthelBathing,
            grooming: dto.barthelGrooming,
            dressing: dto.barthelDressing,
            bowels: dto.barthelBowels,
            bladder: dto.barthelBladder,
            toiletUse: dto.barthelToiletUse,
            transfers: dto.barthelTransfers,
            mobility: dto.barthelMobility,
            stairs: dto.barthelStairs,
        };
        const specialtyPayload = {
            ...dto,
            evaluatorId,
            barthelTotalScore: totalScore,
            dependenceLevel,
            evaluationDate,
        };
        const { encounter, scale } = await this.encounterRepository.manager.transaction((manager) =>
            persistSpecialtyScale(manager, {
                idOlderAdult: dto.idOlderAdult,
                evaluatorId,
                idEncounter: dto.idEncounter,
                encounterType: 'physiotherapy',
                scaleType: 'BARTHEL',
                totalScore,
                interpretation: dependenceLevel,
                responses: { items, source: 'api' },
                specialtyPayload,
            }),
        );

        return {
            ...dto,
            id: encounter.id,
            scaleEvaluationId: scale.id,
            idOlderAdult: dto.idOlderAdult,
            idEncounter: encounter.id,
            evaluatorId,
            evaluationDate: encounter.startTime ?? evaluationDate,
            barthelTotalScore: totalScore,
            dependenceLevel,
            scale: specialtyScaleResponse(encounter, scale, 'physiotherapy'),
        };
    }

    async findByPatient(patientId: number): Promise<Array<PhysiotherapyEvaluation | Record<string, unknown>>> {
        const [legacy, encounters] = await Promise.all([
            this.legacyEvaluationRepository.find({
                where: { idOlderAdult: patientId },
                relations: ['evaluator'],
                order: { evaluationDate: 'DESC' },
            }),
            this.encounterRepository.find({
                where: { idOlderAdult: patientId, encounterType: 'physiotherapy', legacySourceTable: IsNull() },
                relations: ['professional'],
                order: { startTime: 'DESC' },
            }),
        ]);
        const current = await Promise.all(encounters.map(async (encounter) => {
            const scale = await this.scaleRepository.findOne({
                where: { encounterId: encounter.id, scaleType: 'BARTHEL' },
            });
            return scale ? this.toLegacyShape(encounter, scale) : null;
        }));
        return [...legacy, ...current.filter((item): item is Record<string, unknown> => item !== null)];
    }

    async findById(id: number): Promise<PhysiotherapyEvaluation | Record<string, unknown>> {
        const encounter = await this.encounterRepository.findOne({
            where: { id, encounterType: 'physiotherapy', legacySourceTable: IsNull() },
            relations: ['professional'],
        });
        if (encounter) {
            const scale = await this.scaleRepository.findOne({ where: { encounterId: encounter.id, scaleType: 'BARTHEL' } });
            if (scale) return this.toLegacyShape(encounter, scale);
        }
        const legacy = await this.legacyEvaluationRepository.findOne({ where: { id }, relations: ['olderAdult', 'evaluator', 'encounter'] });
        if (legacy) return legacy;
        throw new NotFoundException(`Evaluación de fisioterapia con ID ${id} no encontrada`);
    }

    private toLegacyShape(encounter: ClinicalEncounter, scale: ClinicalScaleEvaluation): Record<string, unknown> {
        const items = (scale.responsesPayload?.items ?? {}) as Record<string, unknown>;
        const unified = specialtyScaleResponse(encounter, scale, 'physiotherapy');
        return {
            ...unified,
            barthelFeeding: items.feeding,
            barthelBathing: items.bathing,
            barthelGrooming: items.grooming,
            barthelDressing: items.dressing,
            barthelBowels: items.bowels,
            barthelBladder: items.bladder,
            barthelToiletUse: items.toiletUse,
            barthelTransfers: items.transfers,
            barthelMobility: items.mobility,
            barthelStairs: items.stairs,
            barthelTotalScore: Number(scale.totalScore),
            dependenceLevel: scale.interpretation,
            evaluatorId: encounter.idProfessional,
            evaluator: encounter.professional,
        };
    }
}
