import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { PhysiotherapyEvaluationsService } from './physiotherapy-evaluations.service';
import { PsychologyEvaluationsService } from './psychology-evaluations.service';
import { SocialWorkEvaluationsService } from './social-work-evaluations.service';
import { ClinicalEncounter, ClinicalScaleEvaluation } from '../../domain/encounters';

describe('Specialties Services - shared clinical encounters and scales', () => {
    let physioService: PhysiotherapyEvaluationsService;
    let psyService: PsychologyEvaluationsService;
    let swService: SocialWorkEvaluationsService;
    let physioRepo: any;
    let psyRepo: any;
    let swRepo: any;
    let encounterRepo: any;
    let scaleRepo: any;
    let olderAdultRepo: any;
    let manager: any;

    beforeEach(() => {
        olderAdultRepo = { findOne: mock(async () => ({ id: 1, oaName: 'María' })) };
        physioRepo = { find: mock(async () => []), findOne: mock(async () => null), save: mock() };
        psyRepo = { find: mock(async () => []), findOne: mock(async () => null), save: mock() };
        swRepo = { find: mock(async () => []), findOne: mock(async () => null), save: mock() };
        let encounterId = 40;
        let scaleId = 80;
        let persistedEncounter: any;
        encounterRepo = {
            create: mock((data: any) => ({ ...data, id: ++encounterId })),
            save: mock(async (entity: any) => { persistedEncounter = entity; return entity; }),
            find: mock(async () => []),
            findOne: mock(async ({ where }: any) => persistedEncounter?.id === where.id ? persistedEncounter : null),
        };
        scaleRepo = {
            create: mock((data: any) => ({ ...data, id: ++scaleId })),
            save: mock(async (entity: any) => entity),
            find: mock(async () => []),
            findOne: mock(async () => null),
        };
        manager = {
            getRepository: (entity: any) => entity === ClinicalEncounter ? encounterRepo : scaleRepo,
            transaction: mock(async (callback: (transactionManager: any) => unknown) => callback(manager)),
        };
        encounterRepo.manager = manager;
        physioService = new PhysiotherapyEvaluationsService(physioRepo, olderAdultRepo, encounterRepo, scaleRepo);
        psyService = new PsychologyEvaluationsService(psyRepo, olderAdultRepo, encounterRepo, scaleRepo);
        swService = new SocialWorkEvaluationsService(swRepo, olderAdultRepo, encounterRepo, scaleRepo);
    });

    it('calcula Barthel y persiste un encuentro más una escala, sin escribir la tabla especializada', async () => {
        const result = await physioService.create({
            idOlderAdult: 1,
            barthelFeeding: 10, barthelBathing: 5, barthelGrooming: 5,
            barthelDressing: 10, barthelBowels: 10, barthelBladder: 10,
            barthelToiletUse: 10, barthelTransfers: 15, barthelMobility: 15, barthelStairs: 10,
        }, 22);

        expect(result.barthelTotalScore).toBe(100);
        expect(result.dependenceLevel).toBe('independent');
        expect(result.idEncounter).toBe(41);
        expect(result.evaluatorId).toBe(22);
        expect(encounterRepo.save).toHaveBeenCalledTimes(1);
        expect(scaleRepo.save).toHaveBeenCalledTimes(1);
        expect(physioRepo.save).not.toHaveBeenCalled();
    });

    it('usa el desglose de respuestas para calcular Yesavage y Pfeiffer', async () => {
        const yesavageResponses = Array.from({ length: 15 }, (_, index) => index < 3);
        const pfeifferResponses = Array.from({ length: 10 }, (_, index) => index === 0);
        const result = await psyService.create({
            idOlderAdult: 1,
            yesavageGdsScore: 3,
            yesavageResponses,
            pfeifferErrorsScore: 1,
            pfeifferResponses,
            emotionalState: 'Estable',
        }, 22);

        expect(result.depressionSeverity).toBe('normal');
        expect(result.cognitiveImpairment).toBe('intact');
        expect(result.idEncounter).toBe(41);
        expect(result.scaleEvaluationIds).toEqual([81, 82]);
        expect(encounterRepo.save).toHaveBeenCalledTimes(2);
        expect(scaleRepo.save).toHaveBeenCalledTimes(2);
        expect(psyRepo.save).not.toHaveBeenCalled();
    });

    it('rechaza un puntaje psicológico que no coincide con las respuestas guardadas', async () => {
        await expect(psyService.create({
            idOlderAdult: 1,
            yesavageGdsScore: 3,
            yesavageResponses: Array.from({ length: 15 }, () => false),
        }, 22)).rejects.toThrow('no coincide');
        expect(encounterRepo.save).not.toHaveBeenCalled();
    });

    it('calcula APGAR y guarda sus cinco respuestas en la escala unificada', async () => {
        const result = await swService.create({
            idOlderAdult: 1,
            apgarAdaptation: 2,
            apgarPartnership: 2,
            apgarGrowth: 2,
            apgarAffection: 2,
            apgarResolve: 2,
        }, 22);

        expect(result.apgarTotalScore).toBe(10);
        expect(result.familyFunctioning).toBe('highly_functional');
        expect(result.evaluatorId).toBe(22);
        expect(scaleRepo.save).toHaveBeenCalledTimes(1);
        const saved = scaleRepo.save.mock.calls[0][0] as ClinicalScaleEvaluation;
        expect(saved.scaleType).toBe('APGAR_FAMILIAR');
        expect(saved.responsesPayload).toHaveProperty('items');
        expect(swRepo.save).not.toHaveBeenCalled();
    });
});
