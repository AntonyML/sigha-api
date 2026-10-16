import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { KardexService } from './kardex.service';
import { AdministrationStatus, PrescriptionStatus } from '../../domain/pharmacy';
import { MedicationAdministration, MedicationPrescription } from '../../domain/pharmacy';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { runWithTenantContext } from '../../common/tenant/tenant-context';

describe('KardexService', () => {
    let service: KardexService;
    let mockAdminRepo: any;
    let mockPrescriptionRepo: any;
    let manager: any;

    const queryBuilder = (getMany: () => Promise<any[]>) => ({
        leftJoinAndSelect: mock(function (this: any) { return this; }),
        where: mock(function (this: any) { return this; }),
        andWhere: mock(function (this: any) { return this; }),
        orderBy: mock(function (this: any) { return this; }),
        getMany: mock(getMany),
    });

    beforeEach(() => {
        mockAdminRepo = {
            create: mock((data: any) => ({ ...data })),
            save: mock(async (data: any) => data),
            findOne: mock(async () => null),
            createQueryBuilder: mock(() => queryBuilder(async () => [])),
        };
        mockPrescriptionRepo = {
            findOne: mock(async () => null),
            createQueryBuilder: mock(() => queryBuilder(async () => [])),
        };
        manager = {
            getRepository: (entity: any) => entity === MedicationPrescription ? mockPrescriptionRepo : mockAdminRepo,
            query: mock(async () => []),
            transaction: mock(async (callback: (transactionManager: any) => unknown) => callback(manager)),
        };
        mockAdminRepo.manager = manager;
        mockPrescriptionRepo.manager = manager;
        service = new KardexService(mockAdminRepo, mockPrescriptionRepo);
    });

    const withTenant = <T>(callback: () => T): T => runWithTenantContext({
        tenantId: 1,
        userId: 99,
        manager,
        queryRunner: {} as any,
    }, callback);

    it('proyecta horarios locales de Costa Rica y GET no escribe administraciones', async () => {
        mockPrescriptionRepo.createQueryBuilder.mockImplementation(() => queryBuilder(async () => [{
            id: 5,
            idOlderAdult: 12,
            status: PrescriptionStatus.ACTIVE,
            startDate: '2026-10-01',
            dosage: '1 tableta',
            specificSchedule: '08:00, 20:00 con alimentos',
            isPrn: false,
        }]));

        const result = await withTenant(() => service.getDailyKardex({ date: '2026-10-15' }));

        expect(result.data).toHaveLength(2);
        expect(result.data.map((entry) => entry.scheduledTime.toISOString())).toEqual([
            '2026-10-15T14:00:00.000Z',
            '2026-10-16T02:00:00.000Z',
        ]);
        expect(result.data.every((entry: any) => entry.id === null && entry.projected === true)).toBe(true);
        expect(mockAdminRepo.create).not.toHaveBeenCalled();
        expect(mockAdminRepo.save).not.toHaveBeenCalled();
    });

    it('suspende proyecciones durante la ausencia temporal del residente', async () => {
        mockPrescriptionRepo.createQueryBuilder.mockImplementation(() => queryBuilder(async () => [{
            id: 5,
            idOlderAdult: 12,
            status: PrescriptionStatus.ACTIVE,
            startDate: '2026-10-01',
            dosage: '1 tableta',
            specificSchedule: '08:00',
            isPrn: false,
        }]));
        manager.query.mockResolvedValue([{ id_older_adult: 12 }]);

        const result = await withTenant(() => service.getDailyKardex({
            date: '2026-10-15',
            status: 'suspended_absence',
        }));

        expect(result.data).toHaveLength(1);
        expect(result.data[0].status).toBe('suspended_absence');
    });

    it('crea un evento real y vincula al actor autenticado', async () => {
        mockPrescriptionRepo.findOne.mockResolvedValue({
            id: 5,
            idOlderAdult: 12,
            status: PrescriptionStatus.ACTIVE,
            startDate: '2026-10-01',
            dosage: '1 tableta',
        });

        const result = await service.recordAdministration({
            idPrescription: 5,
            idOlderAdult: 12,
            scheduledTime: '2026-10-15T14:00:00.000Z',
            status: AdministrationStatus.ADMINISTERED,
        }, 99);

        expect(result.data.status).toBe(AdministrationStatus.ADMINISTERED);
        expect(result.data.administeredBy).toBe(99);
        expect(result.data.doseGiven).toBe('1 tableta');
        expect(mockAdminRepo.save).toHaveBeenCalledTimes(1);
    });

    it('no permite guardar un horario como si fuera una administración', async () => {
        await expect(service.recordAdministration({
            idPrescription: 5,
            idOlderAdult: 12,
            scheduledTime: '2026-10-15T14:00:00.000Z',
            status: AdministrationStatus.SCHEDULED,
        }, 99)).rejects.toThrow(BadRequestException);
        expect(mockAdminRepo.save).not.toHaveBeenCalled();
    });

    it('rechaza una prescripción de otro residente', async () => {
        mockPrescriptionRepo.findOne.mockResolvedValue({
            id: 5,
            idOlderAdult: 88,
            status: PrescriptionStatus.ACTIVE,
            startDate: '2026-10-01',
            dosage: '1 tableta',
        });
        await expect(service.recordAdministration({
            idPrescription: 5,
            idOlderAdult: 12,
            scheduledTime: '2026-10-15T14:00:00.000Z',
            status: AdministrationStatus.ADMINISTERED,
        }, 99)).rejects.toThrow(NotFoundException);
    });
});
