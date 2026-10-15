import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { PsychologyEvaluation, GdsLevel, PfeifferLevel } from '../../domain/specialties';
import { ClinicalEncounter, ClinicalScaleEvaluation } from '../../domain/encounters';
import { CreatePsychologyEvaluationDto } from '../../dto/specialties';
import { persistSpecialtyScale, specialtyScaleResponse } from './specialty-encounter-persistence';

@Injectable()
export class PsychologyEvaluationsService {
    constructor(
        @Inject('PsychologyEvaluationRepository')
        private readonly legacyEvaluationRepository: Repository<PsychologyEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
        @Inject('ClinicalEncounterRepository')
        private readonly encounterRepository: Repository<ClinicalEncounter>,
        @Inject('ClinicalScaleEvaluationRepository')
        private readonly scaleRepository: Repository<ClinicalScaleEvaluation>,
    ) {}

    determineDepressionSeverity(score?: number): GdsLevel | undefined {
        if (score === undefined || score === null) return undefined;
        if (score <= 4) return 'normal';
        if (score <= 8) return 'mild_depression';
        if (score <= 11) return 'moderate_depression';
        return 'severe_depression';
    }

    determineCognitiveImpairment(errors?: number): PfeifferLevel | undefined {
        if (errors === undefined || errors === null) return undefined;
        if (errors <= 2) return 'intact';
        if (errors <= 4) return 'mild_impairment';
        if (errors <= 7) return 'moderate_impairment';
        return 'severe_impairment';
    }

    async create(dto: CreatePsychologyEvaluationDto, evaluatorId: number): Promise<Record<string, unknown>> {
        const olderAdult = await this.olderAdultRepository.findOne({ where: { id: dto.idOlderAdult } });
        if (!olderAdult) throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);

        const yesavageScore = this.resolveScoredAnswers(
            dto.yesavageResponses,
            dto.yesavageGdsScore,
            15,
            'Yesavage',
        );
        const pfeifferScore = this.resolveScoredAnswers(
            dto.pfeifferResponses,
            dto.pfeifferErrorsScore,
            10,
            'Pfeiffer',
        );
        if (yesavageScore === undefined && pfeifferScore === undefined) {
            throw new BadRequestException('Incluya respuestas de Yesavage, Pfeiffer o ambas escalas');
        }

        const depressionSeverity = this.determineDepressionSeverity(yesavageScore);
        const cognitiveImpairment = this.determineCognitiveImpairment(pfeifferScore);
        const evaluationDate = new Date();
        const specialtyPayload = {
            evaluatorId,
            evaluationDate,
            yesavageGdsScore: yesavageScore,
            depressionSeverity,
            pfeifferErrorsScore: pfeifferScore,
            cognitiveImpairment,
            emotionalState: dto.emotionalState,
            behavioralObservations: dto.behavioralObservations,
            interventionPlan: dto.interventionPlan,
            notes: dto.notes,
        };

        const scales: ClinicalScaleEvaluation[] = [];
        let encounter: ClinicalEncounter | undefined;
        await this.encounterRepository.manager.transaction(async (manager) => {
            if (yesavageScore !== undefined && dto.yesavageResponses) {
                const result = await persistSpecialtyScale(manager, {
                    idOlderAdult: dto.idOlderAdult,
                    evaluatorId,
                    idEncounter: encounter?.id ?? dto.idEncounter,
                    encounterType: 'psychology',
                    scaleType: 'YESAVAGE',
                    totalScore: yesavageScore,
                    interpretation: depressionSeverity!,
                    responses: {
                        responses: dto.yesavageResponses,
                        scoring: 'true means depression-indicative response',
                        source: 'api',
                    },
                    specialtyPayload,
                });
                encounter = result.encounter;
                scales.push(result.scale);
            }
            if (pfeifferScore !== undefined && dto.pfeifferResponses) {
                const result = await persistSpecialtyScale(manager, {
                    idOlderAdult: dto.idOlderAdult,
                    evaluatorId,
                    idEncounter: encounter?.id ?? dto.idEncounter,
                    encounterType: 'psychology',
                    scaleType: 'PFEIFFER',
                    totalScore: pfeifferScore,
                    interpretation: cognitiveImpairment!,
                    responses: {
                        responses: dto.pfeifferResponses,
                        scoring: 'true means incorrect answer',
                        source: 'api',
                    },
                    specialtyPayload,
                });
                encounter = result.encounter;
                scales.push(result.scale);
            }
        });
        if (!encounter) throw new BadRequestException('No se pudo registrar la evaluación psicológica');

        return {
            id: encounter.id,
            idEncounter: encounter.id,
            scaleEvaluationIds: scales.map((scale) => scale.id),
            idOlderAdult: dto.idOlderAdult,
            evaluatorId,
            evaluationDate: encounter.startTime ?? evaluationDate,
            yesavageGdsScore: yesavageScore,
            depressionSeverity,
            pfeifferErrorsScore: pfeifferScore,
            cognitiveImpairment,
            emotionalState: dto.emotionalState,
            behavioralObservations: dto.behavioralObservations,
            interventionPlan: dto.interventionPlan,
            notes: dto.notes,
            scaleEvaluations: scales.map((scale) => specialtyScaleResponse(encounter!, scale, 'psychology')),
        };
    }

    async findByPatient(patientId: number): Promise<Array<PsychologyEvaluation | Record<string, unknown>>> {
        const [legacy, encounters] = await Promise.all([
            this.legacyEvaluationRepository.find({
                where: { idOlderAdult: patientId },
                relations: ['evaluator'],
                order: { evaluationDate: 'DESC' },
            }),
            this.encounterRepository.find({
                where: { idOlderAdult: patientId, encounterType: 'psychology', legacySourceTable: IsNull() },
                relations: ['professional'],
                order: { startTime: 'DESC' },
            }),
        ]);
        const current = await Promise.all(encounters.map((encounter) => this.toLegacyShape(encounter)));
        return [...legacy, ...current];
    }

    async findById(id: number): Promise<PsychologyEvaluation | Record<string, unknown>> {
        const encounter = await this.encounterRepository.findOne({
            where: { id, encounterType: 'psychology', legacySourceTable: IsNull() },
            relations: ['professional'],
        });
        if (encounter) return this.toLegacyShape(encounter);
        const legacy = await this.legacyEvaluationRepository.findOne({ where: { id }, relations: ['olderAdult', 'evaluator', 'encounter'] });
        if (legacy) return legacy;
        throw new NotFoundException(`Evaluación psicológica con ID ${id} no encontrada`);
    }

    private resolveScoredAnswers(
        responses: boolean[] | undefined,
        providedScore: number | undefined,
        itemCount: number,
        scaleName: string,
    ): number | undefined {
        if (responses === undefined) {
            if (providedScore !== undefined) {
                throw new BadRequestException(`Las ${itemCount} respuestas puntuadas de ${scaleName} son obligatorias`);
            }
            return undefined;
        }
        if (responses.length !== itemCount) {
            throw new BadRequestException(`${scaleName} requiere exactamente ${itemCount} respuestas`);
        }
        const calculated = responses.filter(Boolean).length;
        if (providedScore !== undefined && providedScore !== calculated) {
            throw new BadRequestException(`El puntaje de ${scaleName} no coincide con el desglose de respuestas`);
        }
        return calculated;
    }

    private async toLegacyShape(encounter: ClinicalEncounter): Promise<Record<string, unknown>> {
        const scales = await this.scaleRepository.find({
            where: [
                { encounterId: encounter.id, scaleType: 'YESAVAGE' },
                { encounterId: encounter.id, scaleType: 'PFEIFFER' },
            ],
            order: { evaluatedAt: 'ASC' },
        });
        const yesavage = scales.find((scale) => scale.scaleType === 'YESAVAGE');
        const pfeiffer = scales.find((scale) => scale.scaleType === 'PFEIFFER');
        const payload = (encounter.specialtyPayload?.psychology ?? {}) as Record<string, unknown>;
        return {
            ...payload,
            id: encounter.id,
            idEncounter: encounter.id,
            idOlderAdult: encounter.idOlderAdult,
            evaluatorId: encounter.idProfessional,
            evaluator: encounter.professional,
            evaluationDate: encounter.startTime,
            yesavageGdsScore: yesavage ? Number(yesavage.totalScore) : undefined,
            depressionSeverity: yesavage?.interpretation,
            yesavageResponses: yesavage?.responsesPayload?.responses,
            pfeifferErrorsScore: pfeiffer ? Number(pfeiffer.totalScore) : undefined,
            cognitiveImpairment: pfeiffer?.interpretation,
            pfeifferResponses: pfeiffer?.responsesPayload?.responses,
            scaleEvaluationIds: scales.map((scale) => scale.id),
            scaleEvaluations: scales.map((scale) => specialtyScaleResponse(encounter, scale, 'psychology')),
            encounter,
        };
    }
}
