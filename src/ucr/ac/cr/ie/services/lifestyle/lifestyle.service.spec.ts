import { describe, it, expect, beforeEach } from 'bun:test';
import { LifestyleService } from './lifestyle.service';
import { NotFoundException } from '@nestjs/common';

describe('LifestyleService', () => {
    let service: LifestyleService;
    let lifestyleRepo: any;
    let olderAdultRepo: any;

    beforeEach(() => {
        lifestyleRepo = {
            create: (data: any) => ({ ...data, id: 1, assessedAt: new Date() }),
            save: async (entity: any) => entity,
            findOne: async (options: any) => null,
            find: async () => [],
        };

        olderAdultRepo = {
            findOne: async (options: any) => ({ id: 1, oaName: 'María' }),
        };

        service = new LifestyleService(lifestyleRepo, olderAdultRepo);
    });

    it('debe registrar una nueva evaluación de estilo de vida', async () => {
        const assessment = await service.createAssessment(
            {
                idOlderAdult: 1,
                dietType: 'soft',
                dietConsistency: 'picada',
                mealsPerDay: 4,
                appetite: 'normal',
                dailyFluidIntakeMl: 1800,
                sleepHoursPerNight: 8,
                sleepQuality: 'good',
                physicalActivityLevel: 'moderate',
                dailyWalkingMinutes: 30,
                smokingStatus: 'never',
                alcoholStatus: 'never',
            },
            10 // userId
        );

        expect(assessment.idOlderAdult).toBe(1);
        expect(assessment.dietType).toBe('soft');
        expect(assessment.sleepHoursPerNight).toBe(8);
        expect(assessment.assessedBy).toBe(10);
    });

    it('debe lanzar NotFoundException si el adulto mayor no existe', async () => {
        olderAdultRepo.findOne = async () => null;

        expect(
            service.createAssessment({
                idOlderAdult: 999,
                dietType: 'general',
            })
        ).rejects.toThrow(NotFoundException);
    });

    it('debe consultar la evaluación más reciente de un adulto mayor', async () => {
        const mockAssessment = {
            id: 1,
            idOlderAdult: 1,
            dietType: 'diabetic',
            sleepHoursPerNight: 7,
        };
        lifestyleRepo.findOne = async () => mockAssessment;

        const result = await service.getLatestAssessment(1);

        expect(result).toBeDefined();
        expect(result?.dietType).toBe('diabetic');
    });

    it('debe retornar el historial de evaluaciones de un adulto mayor', async () => {
        const mockList = [
            { id: 2, idOlderAdult: 1, dietType: 'diabetic' },
            { id: 1, idOlderAdult: 1, dietType: 'general' },
        ];
        lifestyleRepo.find = async () => mockList;

        const result = await service.getAssessmentHistory(1);

        expect(result.length).toBe(2);
    });
});
