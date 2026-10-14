import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PsychologyEvaluation, GdsLevel, PfeifferLevel } from '../../domain/specialties';
import { CreatePsychologyEvaluationDto } from '../../dto/specialties';

@Injectable()
export class PsychologyEvaluationsService {
    constructor(
        @Inject('PsychologyEvaluationRepository')
        private readonly evaluationRepository: Repository<PsychologyEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    determineDepressionSeverity(gdsScore?: number): GdsLevel | undefined {
        if (gdsScore === undefined || gdsScore === null) return undefined;
        if (gdsScore <= 4) return 'normal';
        if (gdsScore <= 8) return 'mild_depression';
        if (gdsScore <= 11) return 'moderate_depression';
        return 'severe_depression';
    }

    determineCognitiveImpairment(pfeifferErrors?: number): PfeifferLevel | undefined {
        if (pfeifferErrors === undefined || pfeifferErrors === null) return undefined;
        if (pfeifferErrors <= 2) return 'intact';
        if (pfeifferErrors <= 4) return 'mild_impairment';
        if (pfeifferErrors <= 7) return 'moderate_impairment';
        return 'severe_impairment';
    }

    async create(dto: CreatePsychologyEvaluationDto): Promise<PsychologyEvaluation> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const depressionSeverity = this.determineDepressionSeverity(dto.yesavageGdsScore);
        const cognitiveImpairment = this.determineCognitiveImpairment(dto.pfeifferErrorsScore);

        const evaluation = this.evaluationRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idEncounter: dto.idEncounter,
            evaluatorId: dto.evaluatorId,
            evaluationDate: new Date(),
            yesavageGdsScore: dto.yesavageGdsScore,
            depressionSeverity,
            pfeifferErrorsScore: dto.pfeifferErrorsScore,
            cognitiveImpairment,
            emotionalState: dto.emotionalState,
            behavioralObservations: dto.behavioralObservations,
            interventionPlan: dto.interventionPlan,
            notes: dto.notes
        });

        return this.evaluationRepository.save(evaluation);
    }

    async findByPatient(patientId: number): Promise<PsychologyEvaluation[]> {
        return this.evaluationRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['evaluator'],
            order: { evaluationDate: 'DESC' }
        });
    }

    async findById(id: number): Promise<PsychologyEvaluation> {
        const evaluation = await this.evaluationRepository.findOne({
            where: { id },
            relations: ['olderAdult', 'evaluator', 'encounter']
        });
        if (!evaluation) {
            throw new NotFoundException(`Evaluación psicológica con ID ${id} no encontrada`);
        }
        return evaluation;
    }
}
