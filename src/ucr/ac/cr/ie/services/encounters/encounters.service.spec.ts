import { describe, it, expect, beforeEach } from 'bun:test';
import { EncountersService } from './encounters.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClinicalEncounter, ClinicalNoteAddendum } from '../../domain/encounters';
import { runWithTenantContext } from '../../common/tenant/tenant-context';

describe('EncountersService', () => {
    let service: EncountersService;
    let encounterRepo: any;
    let addendumRepo: any;
    let olderAdultRepo: any;
    let manager: any;

    beforeEach(() => {
        encounterRepo = {
            create: (data: any) => ({ ...data, id: 10 }),
            save: async (entity: any) => ({ ...entity, id: entity.id || 10 }),
            findOne: async () => null,
            find: async () => [],
        };
        addendumRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => ({ ...entity, id: 1 }),
        };
        manager = {
            getRepository: (entity: any) => entity === ClinicalEncounter ? encounterRepo : addendumRepo,
            transaction: async (callback: (transactionManager: any) => unknown) => callback(manager),
        };
        encounterRepo.manager = manager;
        addendumRepo.manager = manager;
        olderAdultRepo = { findOne: async () => ({ id: 1, oaName: 'Juan' }) };
        service = new EncountersService(encounterRepo, addendumRepo, olderAdultRepo);
    });

    const withTenant = <T>(callback: () => T): T => runWithTenantContext({
        tenantId: 7,
        userId: 22,
        manager,
        queryRunner: {} as any,
    }, callback);

    it('crea un encuentro clínico en estado scheduled', async () => {
        const encounter = await service.createEncounter({
            idOlderAdult: 1,
            encounterType: 'nursing',
            chiefComplaint: 'Control general',
        });

        expect(encounter.id).toBe(10);
        expect(encounter.status).toBe('scheduled');
        expect(encounter.isSigned).toBe(false);
    });

    it('rechaza la creación si el paciente no existe', async () => {
        olderAdultRepo.findOne = async () => null;
        await expect(service.createEncounter({ idOlderAdult: 999, encounterType: 'nursing' }))
            .rejects.toThrow(NotFoundException);
    });

    it('actualiza notas SOAP mientras el encuentro no está firmado', async () => {
        encounterRepo.findOne = async () => ({ id: 10, isSigned: false, status: 'scheduled' });
        const updated = await service.updateSoap(10, {
            soSubjective: 'Dolor de espalda',
            soPlan: 'Reposo',
            status: 'in_progress',
        });
        expect(updated.soSubjective).toBe('Dolor de espalda');
        expect(updated.status).toBe('in_progress');
    });

    it('rechaza SOAP firmado', async () => {
        encounterRepo.findOne = async () => ({ id: 10, isSigned: true, status: 'signed' });
        await expect(service.updateSoap(10, { soSubjective: 'Cambio' })).rejects.toThrow(BadRequestException);
    });

    it('firma con el actor autenticado y genera el hash inmutable versionado', async () => {
        encounterRepo.findOne = async () => ({
            id: 10, idOlderAdult: 4, isSigned: false, status: 'in_progress',
            soSubjective: 'Dolor', soObjective: null, soAssessment: 'Gonalgia', soPlan: 'Control',
        });
        const signed = await withTenant(() => service.signEncounter(10, 22));
        expect(signed.isSigned).toBe(true);
        expect(signed.status).toBe('signed');
        expect(signed.signedBy).toBe(22);
        expect(signed.signatureVersion).toBe('1');
        expect(signed.signatureHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('añade una enmienda firmada por el actor autenticado solo a un encuentro firmado', async () => {
        encounterRepo.findOne = async () => ({ id: 10, idOlderAdult: 4, isSigned: true, status: 'signed' });
        const addendum = await withTenant(() => service.createAddendum(10, 22, {
            addendumText: 'Dosis ajustada a 500mg',
            reasonForAddendum: 'Aclaración médica',
        }));
        expect(addendum.id).toBe(1);
        expect(addendum.authorId).toBe(22);
        expect(addendum.signedBy).toBe(22);
        expect(addendum.status).toBe('signed');
        expect(addendum.signatureHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('rechaza addenda si el encuentro aún no ha sido firmado', async () => {
        encounterRepo.findOne = async () => ({ id: 10, isSigned: false, status: 'in_progress' });
        await expect(withTenant(() => service.createAddendum(10, 22, {
            addendumText: 'Texto', reasonForAddendum: 'Razón',
        }))).rejects.toThrow(BadRequestException);
    });
});
