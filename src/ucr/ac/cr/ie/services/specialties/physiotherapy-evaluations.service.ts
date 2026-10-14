import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PhysiotherapyEvaluation, BarthelLevel } from '../../domain/specialties';
import { CreatePhysiotherapyEvaluationDto } from '../../dto/specialties';

@Injectable()
export class PhysiotherapyEvaluationsService {
    constructor(
        @Inject('PhysiotherapyEvaluationRepository')
        private readonly evaluationRepository: Repository<PhysiotherapyEvaluation>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    calculateBarthelTotalScore(dto: CreatePhysiotherapyEvaluationDto): number {
        return (
            dto.barthelFeeding +
            dto.barthelBathing +
            dto.barthelGrooming +
            dto.barthelDressing +
            dto.barthelBowels +
            dto.barthelBladder +
            dto.barthelToiletUse +
            dto.barthelTransfers +
            dto.barthelMobility +
            dto.barthelStairs
        );
    }

    determineDependenceLevel(score: number): BarthelLevel {
        if (score === 100) return 'independent';
        if (score >= 91) return 'mild_dependence';
        if (score >= 61) return 'moderate_dependence';
        if (score >= 21) return 'severe_dependence';
        return 'total_dependence';
    }

    async create(dto: CreatePhysiotherapyEvaluationDto): Promise<PhysiotherapyEvaluation> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const totalScore = this.calculateBarthelTotalScore(dto);
        const dependenceLevel = this.determineDependenceLevel(totalScore);

        const evaluation = this.evaluationRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idEncounter: dto.idEncounter,
            evaluatorId: dto.evaluatorId,
            evaluationDate: new Date(),
            barthelFeeding: dto.barthelFeeding,
            barthelBathing: dto.barthelBathing,
            barthelGrooming: dto.barthelGrooming,
            barthelDressing: dto.barthelDressing,
            barthelBowels: dto.barthelBowels,
            barthelBladder: dto.barthelBladder,
            barthelToiletUse: dto.barthelToiletUse,
            barthelTransfers: dto.barthelTransfers,
            barthelMobility: dto.barthelMobility,
            barthelStairs: dto.barthelStairs,
            barthelTotalScore: totalScore,
            dependenceLevel,
            tinettiGaitScore: dto.tinettiGaitScore,
            tinettiBalanceScore: dto.tinettiBalanceScore,
            rehabilitationGoals: dto.rehabilitationGoals,
            treatmentPlan: dto.treatmentPlan,
            notes: dto.notes
        });

        return this.evaluationRepository.save(evaluation);
    }

    async findByPatient(patientId: number): Promise<PhysiotherapyEvaluation[]> {
        return this.evaluationRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['evaluator'],
            order: { evaluationDate: 'DESC' }
        });
    }

    async findById(id: number): Promise<PhysiotherapyEvaluation> {
        const evaluation = await this.evaluationRepository.findOne({
            where: { id },
            relations: ['olderAdult', 'evaluator', 'encounter']
        });
        if (!evaluation) {
            throw new NotFoundException(`Evaluación de fisioterapia con ID ${id} no encontrada`);
        }
        return evaluation;
    }
}
