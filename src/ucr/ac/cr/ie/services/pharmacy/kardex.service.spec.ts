import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { KardexService } from './kardex.service';
import { AdministrationStatus, PrescriptionStatus } from '../../domain/pharmacy';
import { NotFoundException } from '@nestjs/common';

describe('KardexService', () => {
    let service: KardexService;
    let mockAdminRepo: any;
    let mockPrescriptionRepo: any;
    let mockOlderAdultRepo: any;
    let mockLogger: any;

    beforeEach(() => {
        mockAdminRepo = {
            create: mock((data: any) => ({ id: 100, ...data })),
            save: mock(async (data: any) => data),
            findOne: mock(async () => null),
            count: mock(async () => 0),
            createQueryBuilder: mock(() => ({
                leftJoinAndSelect: mock().mockReturnThis(),
                where: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                getMany: mock(async () => []),
            })),
        };

        mockPrescriptionRepo = {
            findOne: mock(async () => null),
            createQueryBuilder: mock(() => ({
                where: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                getMany: mock(async () => []),
            })),
        };

        mockOlderAdultRepo = {
            findOne: mock(async () => null),
        };

        mockLogger = {
            info: mock(),
            error: mock(),
            warn: mock(),
            debug: mock(),
        };

        service = new KardexService(
            mockLogger,
            mockAdminRepo,
            mockPrescriptionRepo,
            mockOlderAdultRepo
        );
    });

    describe('recordAdministration', () => {
        it('debe registrar administración sobre un slot existente', async () => {
            const existingSlot = {
                id: 55,
                status: AdministrationStatus.SCHEDULED,
            };
            mockAdminRepo.findOne = mock(async () => existingSlot);

            const result = await service.recordAdministration({
                id: 55,
                status: AdministrationStatus.ADMINISTERED,
                doseGiven: '1 tableta',
            }, 99);

            expect(result.data.status).toBe(AdministrationStatus.ADMINISTERED);
            expect(result.data.administeredBy).toBe(99);
            expect(mockAdminRepo.save).toHaveBeenCalled();
        });

        it('debe lanzar NotFoundException si el slot indicado por id no existe', async () => {
            mockAdminRepo.findOne = mock(async () => null);

            await expect(service.recordAdministration({
                id: 9999,
                status: AdministrationStatus.ADMINISTERED,
            })).rejects.toThrow(NotFoundException);
        });
    });
});
