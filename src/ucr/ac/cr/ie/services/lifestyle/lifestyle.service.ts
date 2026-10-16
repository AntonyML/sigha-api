import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PatientLifestyleAssessment } from '../../domain/lifestyle';
import { CreateLifestyleAssessmentDto } from '../../dto/lifestyle';

@Injectable()
export class LifestyleService {
    constructor(
        @Inject('PatientLifestyleAssessmentRepository')
        private readonly lifestyleRepository: Repository<PatientLifestyleAssessment>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async createAssessment(
        dto: CreateLifestyleAssessmentDto,
        userId?: number
    ): Promise<PatientLifestyleAssessment> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const assessment = this.lifestyleRepository.create({
            idOlderAdult: dto.idOlderAdult,
            assessedBy: userId,
            dietType: dto.dietType ?? 'general',
            dietConsistency: dto.dietConsistency ?? 'regular',
            dietAllergiesIntolerances: dto.dietAllergiesIntolerances,
            mealsPerDay: dto.mealsPerDay ?? 4,
            appetite: dto.appetite ?? 'normal',
            dailyFluidIntakeMl: dto.dailyFluidIntakeMl ?? 1500,
            requiresFluidThickener: dto.requiresFluidThickener ?? false,
            dietNotes: dto.dietNotes,
            sleepHoursPerNight: dto.sleepHoursPerNight ?? 7.0,
            sleepQuality: dto.sleepQuality ?? 'good',
            sleepMedicationRequired: dto.sleepMedicationRequired ?? false,
            sleepNotes: dto.sleepNotes,
            physicalActivityLevel: dto.physicalActivityLevel ?? 'sedentary',
            dailyWalkingMinutes: dto.dailyWalkingMinutes ?? 15,
            mobilityAssistanceRequired: dto.mobilityAssistanceRequired ?? false,
            physicalActivityNotes: dto.physicalActivityNotes,
            smokingStatus: dto.smokingStatus ?? 'never',
            smokingPacksYear: dto.smokingPacksYear ?? 0.0,
            alcoholStatus: dto.alcoholStatus ?? 'never',
            lifestyleSummary: dto.lifestyleSummary,
        });

        return this.lifestyleRepository.save(assessment);
    }

    async getLatestAssessment(patientId: number): Promise<PatientLifestyleAssessment | null> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: patientId }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${patientId} no encontrado`);
        }

        return this.lifestyleRepository.findOne({
            where: { idOlderAdult: patientId },
            order: { assessedAt: 'DESC' },
            relations: ['assessor'],
        });
    }

    async getAssessmentHistory(patientId: number): Promise<PatientLifestyleAssessment[]> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: patientId }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${patientId} no encontrado`);
        }

        return this.lifestyleRepository.find({
            where: { idOlderAdult: patientId },
            order: { assessedAt: 'DESC' },
            relations: ['assessor'],
        });
    }
}
