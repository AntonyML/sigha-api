import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { PharmacyService } from './pharmacy.service';
import { AdministrationRoute, PrescriptionStatus } from '../../domain/pharmacy';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PharmacyService', () => {
    let service: PharmacyService;
    let mockMedicationRepo: any;
    let mockPrescriptionRepo: any;
    let mockOlderAdultRepo: any;
    let mockLogger: any;

    beforeEach(() => {
        mockMedicationRepo = {
            create: mock((data: any) => ({ id: 1, ...data })),
            save: mock(async (data: any) => ({ id: 1, ...data })),
            findOne: mock(async () => null),
            createQueryBuilder: mock(() => ({
                where: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                getMany: mock(async () => []),
            })),
        };

        mockPrescriptionRepo = {
            create: mock((data: any) => ({ id: 10, ...data })),
            save: mock(async (data: any) => ({ id: 10, ...data })),
            findOne: mock(async () => null),
            find: mock(async () => []),
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

        service = new PharmacyService(
            mockLogger,
            mockMedicationRepo,
            mockPrescriptionRepo,
            mockOlderAdultRepo
        );
    });

    describe('createMedication', () => {
        it('debe crear un medicamento en el catálogo con los valores por defecto', async () => {
            const dto = {
                name: 'Enalapril 20mg',
                activeSubstance: 'Enalapril',
                concentration: '20 mg',
                pharmaceuticalForm: 'tableta',
                defaultRoute: AdministrationRoute.ORAL,
            };

            const result = await service.createMedication(dto);
            expect(result.data.name).toBe('Enalapril 20mg');
            expect(mockMedicationRepo.save).toHaveBeenCalled();
        });
    });

    describe('createPrescription', () => {
        it('debe lanzar NotFoundException si el residente no existe', async () => {
            mockOlderAdultRepo.findOne = mock(async () => null);

            await expect(service.createPrescription({
                idOlderAdult: 999,
                idMedication: 1,
                dosage: '1 tableta',
                startDate: '2026-10-14',
            })).rejects.toThrow(NotFoundException);
        });

        it('debe crear la prescripción activa si el residente y medicamento existen', async () => {
            mockOlderAdultRepo.findOne = mock(async () => ({ id: 1 }));
            mockMedicationRepo.findOne = mock(async () => ({ id: 5, name: 'Losartán 50mg' }));

            const result = await service.createPrescription({
                idOlderAdult: 1,
                idMedication: 5,
                dosage: '1 tableta',
                frequencyHours: 12,
                startDate: '2026-10-14',
            }, 42);

            expect(result.data.status).toBe(PrescriptionStatus.ACTIVE);
            expect(result.data.prescribedBy).toBe(42);
        });
    });
});
