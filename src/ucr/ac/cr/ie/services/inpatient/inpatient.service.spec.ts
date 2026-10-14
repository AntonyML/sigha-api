import { describe, it, expect, beforeEach } from 'bun:test';
import { InpatientService } from './inpatient.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('InpatientService', () => {
    let service: InpatientService;
    let roomRepo: any;
    let bedRepo: any;
    let olderAdultRepo: any;

    beforeEach(() => {
        roomRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => entity,
            findOne: async (options: any) => null,
            find: async () => [],
        };

        bedRepo = {
            create: (data: any) => ({ ...data, id: 1 }),
            save: async (entity: any) => entity,
            findOne: async (options: any) => null,
            find: async () => [],
        };

        olderAdultRepo = {
            findOne: async (options: any) => ({ id: 1, oaName: 'Carlos' }),
        };

        service = new InpatientService(roomRepo, bedRepo, olderAdultRepo);
    });

    it('debe registrar una nueva habitación', async () => {
        const room = await service.createRoom({
            roomNumber: 'HAB-105',
            name: 'Habitación 105',
            capacity: 2,
        });

        expect(room.roomNumber).toBe('HAB-105');
        expect(room.capacity).toBe(2);
    });

    it('debe rechazar la creación si el número de habitación ya existe', async () => {
        roomRepo.findOne = async () => ({ id: 1, roomNumber: 'HAB-105' });

        expect(
            service.createRoom({
                roomNumber: 'HAB-105',
                name: 'Habitación duplicada',
            })
        ).rejects.toThrow(ConflictException);
    });

    it('debe asignar cama y dar de baja asignación previa activa', async () => {
        roomRepo.findOne = async () => ({ id: 2, roomNumber: 'HAB-201', isActive: true });
        
        let previousDischarged = false;
        bedRepo.findOne = async (options: any) => ({
            id: 10,
            idOlderAdult: 1,
            isCurrent: true,
        });

        bedRepo.save = async (entity: any) => {
            if (entity.id === 10 && entity.isCurrent === false) {
                previousDischarged = true;
            }
            return entity;
        };

        const newAssignment = await service.assignBed({
            idOlderAdult: 1,
            idRoom: 2,
            bedLabel: 'Cama 2B',
        });

        expect(previousDischarged).toBe(true);
        expect(newAssignment.bedLabel).toBe('Cama 2B');
        expect(newAssignment.isCurrent).toBe(true);
    });
});
