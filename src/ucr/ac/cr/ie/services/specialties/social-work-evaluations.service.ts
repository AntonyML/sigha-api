import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SocialWorkEvaluation, ApgarLevel } from '../../domain/specialties';
import { CreateSocialWorkEvaluationDto } from '../../dto/specialties';

@Injectable()
export class SocialWorkEvaluationsService {
    constructor(
        @Inject('SocialWorkEvaluationRepository')
        private readonly evaluationRepository: Repository<SocialWorkEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    calculateApgarTotalScore(dto: CreateSocialWorkEvaluationDto): number {
        return (
            dto.apgarAdaptation +
            dto.apgarPartnership +
            dto.apgarGrowth +
            dto.apgarAffection +
            dto.apgarResolve
        );
    }

    determineFamilyFunctioning(score: number): ApgarLevel {
        if (score >= 7) return 'highly_functional';
        if (score >= 4) return 'mild_dysfunction';
        return 'severe_dysfunction';
    }

    async create(dto: CreateSocialWorkEvaluationDto): Promise<SocialWorkEvaluation> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const apgarTotal = this.calculateApgarTotalScore(dto);
        const familyFunctioning = this.determineFamilyFunctioning(apgarTotal);

        const evaluation = this.evaluationRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idEncounter: dto.idEncounter,
            evaluatorId: dto.evaluatorId,
            evaluationDate: new Date(),
            apgarAdaptation: dto.apgarAdaptation,
            apgarPartnership: dto.apgarPartnership,
            apgarGrowth: dto.apgarGrowth,
            apgarAffection: dto.apgarAffection,
            apgarResolve: dto.apgarResolve,
            apgarTotalScore: apgarTotal,
            familyFunctioning,
            familySupportNetwork: dto.familySupportNetwork,
            socioeconomicAssessment: dto.socioeconomicAssessment,
            institutionalRecommendations: dto.institutionalRecommendations,
            notes: dto.notes
        });

        return this.evaluationRepository.save(evaluation);
    }

    async findByPatient(patientId: number): Promise<SocialWorkEvaluation[]> {
        return this.evaluationRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['evaluator'],
            order: { evaluationDate: 'DESC' }
        });
    }

    async findById(id: number): Promise<SocialWorkEvaluation> {
        const evaluation = await this.evaluationRepository.findOne({
            where: { id },
            relations: ['olderAdult', 'evaluator', 'encounter']
        });
        if (!evaluation) {
            throw new NotFoundException(`Evaluación de trabajo social con ID ${id} no encontrada`);
        }
        return evaluation;
    }
}
