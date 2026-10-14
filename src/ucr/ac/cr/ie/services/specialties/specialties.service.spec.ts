import { describe, it, expect, beforeEach } from 'bun:test';
import { PhysiotherapyEvaluationsService } from './physiotherapy-evaluations.service';
import { PsychologyEvaluationsService } from './psychology-evaluations.service';
import { SocialWorkEvaluationsService } from './social-work-evaluations.service';

describe('Specialties Services - Escalas Geriátricas Estandarizadas', () => {
    let physioService: PhysiotherapyEvaluationsService;
    let psyService: PsychologyEvaluationsService;
    let swService: SocialWorkEvaluationsService;

    let physioRepo: any;
    let psyRepo: any;
    let swRepo: any;
    let olderAdultRepo: any;

    beforeEach(() => {
        olderAdultRepo = {
            findOne: async (options: any) => ({ id: 1, oaName: 'María' }),
        };

        physioRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => entity,
            find: async () => [],
            findOne: async () => null,
        };

        psyRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => entity,
            find: async () => [],
            findOne: async () => null,
        };

        swRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => entity,
            find: async () => [],
            findOne: async () => null,
        };

        physioService = new PhysiotherapyEvaluationsService(physioRepo, olderAdultRepo);
        psyService = new PsychologyEvaluationsService(psyRepo, olderAdultRepo);
        swService = new SocialWorkEvaluationsService(swRepo, olderAdultRepo);
    });

    describe('Fisioterapia (Índice de Barthel)', () => {
        it('debe calcular 100 puntos y nivel independent cuando todas las actividades son autónomas', async () => {
            const result = await physioService.create({
                idOlderAdult: 1,
                evaluatorId: 22,
                barthelFeeding: 10,
                barthelBathing: 5,
                barthelGrooming: 5,
                barthelDressing: 10,
                barthelBowels: 10,
                barthelBladder: 10,
                barthelToiletUse: 10,
                barthelTransfers: 15,
                barthelMobility: 15,
                barthelStairs: 10,
            });

            expect(result.barthelTotalScore).toBe(100);
            expect(result.dependenceLevel).toBe('independent');
        });

        it('debe calcular dependencia severa cuando el puntaje está entre 21 y 60', async () => {
            const result = await physioService.create({
                idOlderAdult: 1,
                evaluatorId: 22,
                barthelFeeding: 5,
                barthelBathing: 0,
                barthelGrooming: 0,
                barthelDressing: 5,
                barthelBowels: 5,
                barthelBladder: 5,
                barthelToiletUse: 5,
                barthelTransfers: 10,
                barthelMobility: 10,
                barthelStairs: 5,
            });

            expect(result.barthelTotalScore).toBe(50);
            expect(result.dependenceLevel).toBe('severe_dependence');
        });
    });

    describe('Psicología (Yesavage GDS & Pfeiffer SPMSQ)', () => {
        it('debe clasificar correctamente niveles de depresión según Yesavage GDS', async () => {
            expect(psyService.determineDepressionSeverity(2)).toBe('normal');
            expect(psyService.determineDepressionSeverity(6)).toBe('mild_depression');
            expect(psyService.determineDepressionSeverity(10)).toBe('moderate_depression');
            expect(psyService.determineDepressionSeverity(14)).toBe('severe_depression');
        });

        it('debe clasificar deterioro cognitivo según errores en Pfeiffer SPMSQ', async () => {
            expect(psyService.determineCognitiveImpairment(1)).toBe('intact');
            expect(psyService.determineCognitiveImpairment(3)).toBe('mild_impairment');
            expect(psyService.determineCognitiveImpairment(6)).toBe('moderate_impairment');
            expect(psyService.determineCognitiveImpairment(9)).toBe('severe_impairment');
        });

        it('debe crear evaluación con severidades calculadas', async () => {
            const evalResult = await psyService.create({
                idOlderAdult: 1,
                evaluatorId: 22,
                yesavageGdsScore: 3,
                pfeifferErrorsScore: 1,
                emotionalState: 'Estable',
            });

            expect(evalResult.depressionSeverity).toBe('normal');
            expect(evalResult.cognitiveImpairment).toBe('intact');
        });
    });

    describe('Trabajo Social (APGAR familiar)', () => {
        it('debe calcular APGAR 10 y clasificar como altamente funcional', async () => {
            const result = await swService.create({
                idOlderAdult: 1,
                evaluatorId: 22,
                apgarAdaptation: 2,
                apgarPartnership: 2,
                apgarGrowth: 2,
                apgarAffection: 2,
                apgarResolve: 2,
            });

            expect(result.apgarTotalScore).toBe(10);
            expect(result.familyFunctioning).toBe('highly_functional');
        });

        it('debe clasificar disfunción severa cuando el puntaje es menor o igual a 3', async () => {
            const result = await swService.create({
                idOlderAdult: 1,
                evaluatorId: 22,
                apgarAdaptation: 0,
                apgarPartnership: 1,
                apgarGrowth: 0,
                apgarAffection: 1,
                apgarResolve: 0,
            });

            expect(result.apgarTotalScore).toBe(2);
            expect(result.familyFunctioning).toBe('severe_dysfunction');
        });
    });
});
