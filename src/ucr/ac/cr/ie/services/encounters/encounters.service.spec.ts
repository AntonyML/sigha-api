import { describe, it, expect, beforeEach } from 'bun:test';
import { EncountersService } from './encounters.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EncountersService', () => {
    let service: EncountersService;
    let encounterRepo: any;
    let addendumRepo: any;
    let olderAdultRepo: any;

    beforeEach(() => {
        encounterRepo = {
            create: (data: any) => ({ ...data, id: 10 }),
            save: async (entity: any) => ({ ...entity, id: entity.id || 10 }),
            findOne: async (options: any) => null,
            find: async (options: any) => [],
        };
        addendumRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => ({ ...entity, id: 1 }),
        };
        olderAdultRepo = {
            findOne: async (options: any) => ({ id: 1, oaName: 'Juan' }),
        };

        service = new EncountersService(encounterRepo, addendumRepo, olderAdultRepo);
    });

    it('debe crear un encuentro clínico en estado scheduled', async () => {
        const encounter = await service.createEncounter({
            idOlderAdult: 1,
            encounterType: 'nursing',
            chiefComplaint: 'Control general',
        });

        expect(encounter.id).toBe(10);
        expect(encounter.status).toBe('scheduled');
        expect(encounter.isSigned).toBe(false);
    });

    it('debe rechazar la creación si el paciente no existe', async () => {
        olderAdultRepo.findOne = async () => null;

        expect(
            service.createEncounter({
                idOlderAdult: 999,
                encounterType: 'nursing',
            })
        ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar notas SOAP si el encuentro no está firmado', async () => {
        encounterRepo.findOne = async () => ({
            id: 10,
            isSigned: false,
            status: 'scheduled',
        });

        const updated = await service.updateSoap(10, {
            soSubjective: 'Dolor de espalda',
            soPlan: 'Reposo',
            status: 'in_progress',
        });

        expect(updated.soSubjective).toBe('Dolor de espalda');
        expect(updated.status).toBe('in_progress');
    });

    it('debe RECHAZAR actualización SOAP con BadRequestException si la nota ya fue firmada (inmutabilidad GNU Health)', async () => {
        encounterRepo.findOne = async () => ({
            id: 10,
            isSigned: true,
            signedAt: new Date(),
        });

        expect(
            service.updateSoap(10, {
                soSubjective: 'Modificación no permitida',
            })
        ).rejects.toThrow(BadRequestException);
    });

    it('debe firmar y cerrar el encuentro marcándolo completed', async () => {
        encounterRepo.findOne = async () => ({
            id: 10,
            isSigned: false,
            status: 'in_progress',
        });

        const signed = await service.signEncounter(10, { signedBy: 22 });
        expect(signed.isSigned).toBe(true);
        expect(signed.status).toBe('completed');
        expect(signed.signedBy).toBe(22);
    });

    it('debe registrar un addendum solo si el encuentro ya está firmado', async () => {
        encounterRepo.findOne = async () => ({
            id: 10,
            isSigned: true,
        });

        const addendum = await service.createAddendum({
            idEncounter: 10,
            authorId: 22,
            addendumText: 'Dosis ajustada a 500mg',
            reasonForAddendum: 'Aclaración médica',
        });

        expect(addendum.id).toBe(1);
        expect(addendum.addendumText).toBe('Dosis ajustada a 500mg');
    });

    it('debe rechazar un addendum si el encuentro aún no ha sido firmado', async () => {
        encounterRepo.findOne = async () => ({
            id: 10,
            isSigned: false,
        });

        expect(
            service.createAddendum({
                idEncounter: 10,
                authorId: 22,
                addendumText: 'Texto',
                reasonForAddendum: 'Razón',
            })
        ).rejects.toThrow(BadRequestException);
    });
});
