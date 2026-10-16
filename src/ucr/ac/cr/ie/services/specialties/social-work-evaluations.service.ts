import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { SocialWorkEvaluation, ApgarLevel } from '../../domain/specialties';
import { ClinicalEncounter, ClinicalScaleEvaluation } from '../../domain/encounters';
import { CreateSocialWorkEvaluationDto } from '../../dto/specialties';
import { persistSpecialtyScale, specialtyScaleResponse } from './specialty-encounter-persistence';

@Injectable()
export class SocialWorkEvaluationsService {
    constructor(
        @Inject('SocialWorkEvaluationRepository')
        private readonly legacyEvaluationRepository: Repository<SocialWorkEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
        @Inject('ClinicalEncounterRepository')
        private readonly encounterRepository: Repository<ClinicalEncounter>,
        @Inject('ClinicalScaleEvaluationRepository')
        private readonly scaleRepository: Repository<ClinicalScaleEvaluation>,
    ) {}

    calculateApgarTotalScore(dto: CreateSocialWorkEvaluationDto): number {
        return dto.apgarAdaptation + dto.apgarPartnership + dto.apgarGrowth
            + dto.apgarAffection + dto.apgarResolve;
    }

    determineFamilyFunctioning(score: number): ApgarLevel {
        if (score >= 7) return 'highly_functional';
        if (score >= 4) return 'mild_dysfunction';
        return 'severe_dysfunction';
    }

    async create(dto: CreateSocialWorkEvaluationDto, evaluatorId: number): Promise<Record<string, unknown>> {
        const olderAdult = await this.olderAdultRepository.findOne({ where: { id: dto.idOlderAdult } });
        if (!olderAdult) throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);

        const totalScore = this.calculateApgarTotalScore(dto);
        const familyFunctioning = this.determineFamilyFunctioning(totalScore);
        const evaluationDate = new Date();
        const items = {
            adaptation: dto.apgarAdaptation,
            partnership: dto.apgarPartnership,
            growth: dto.apgarGrowth,
            affection: dto.apgarAffection,
            resolve: dto.apgarResolve,
        };
        const specialtyPayload = {
            ...dto,
            evaluatorId,
            apgarTotalScore: totalScore,
            familyFunctioning,
            evaluationDate,
        };
        const { encounter, scale } = await this.encounterRepository.manager.transaction((manager) =>
            persistSpecialtyScale(manager, {
                idOlderAdult: dto.idOlderAdult,
                evaluatorId,
                idEncounter: dto.idEncounter,
                encounterType: 'social_work',
                scaleType: 'APGAR_FAMILIAR',
                totalScore,
                interpretation: familyFunctioning,
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
            apgarTotalScore: totalScore,
            familyFunctioning,
            scale: specialtyScaleResponse(encounter, scale, 'social_work'),
        };
    }

    async findByPatient(patientId: number): Promise<Array<SocialWorkEvaluation | Record<string, unknown>>> {
        const [legacy, encounters] = await Promise.all([
            this.legacyEvaluationRepository.find({
                where: { idOlderAdult: patientId },
                relations: ['evaluator'],
                order: { evaluationDate: 'DESC' },
            }),
            this.encounterRepository.find({
                where: { idOlderAdult: patientId, encounterType: 'social_work', legacySourceTable: IsNull() },
                relations: ['professional'],
                order: { startTime: 'DESC' },
            }),
        ]);
        const current = await Promise.all(encounters.map(async (encounter) => {
            const scale = await this.scaleRepository.findOne({
                where: { encounterId: encounter.id, scaleType: 'APGAR_FAMILIAR' },
            });
            return scale ? this.toLegacyShape(encounter, scale) : null;
        }));
        return [...legacy, ...current.filter((item): item is Record<string, unknown> => item !== null)];
    }

    async findById(id: number): Promise<SocialWorkEvaluation | Record<string, unknown>> {
        const encounter = await this.encounterRepository.findOne({
            where: { id, encounterType: 'social_work', legacySourceTable: IsNull() },
            relations: ['professional'],
        });
        if (encounter) {
            const scale = await this.scaleRepository.findOne({ where: { encounterId: encounter.id, scaleType: 'APGAR_FAMILIAR' } });
            if (scale) return this.toLegacyShape(encounter, scale);
        }
        const legacy = await this.legacyEvaluationRepository.findOne({ where: { id }, relations: ['olderAdult', 'evaluator', 'encounter'] });
        if (legacy) return legacy;
        throw new NotFoundException(`Evaluación de trabajo social con ID ${id} no encontrada`);
    }

    private toLegacyShape(encounter: ClinicalEncounter, scale: ClinicalScaleEvaluation): Record<string, unknown> {
        const items = (scale.responsesPayload?.items ?? {}) as Record<string, unknown>;
        const unified = specialtyScaleResponse(encounter, scale, 'social_work');
        return {
            ...unified,
            apgarAdaptation: items.adaptation,
            apgarPartnership: items.partnership,
            apgarGrowth: items.growth,
            apgarAffection: items.affection,
            apgarResolve: items.resolve,
            apgarTotalScore: Number(scale.totalScore),
            familyFunctioning: scale.interpretation,
            evaluatorId: encounter.idProfessional,
            evaluator: encounter.professional,
        };
    }
}
