import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { CreateClinicalMedicationDto } from '../../dto/clinical-medication/create-clinical-medication.dto';
import type { ClinicalMedication, TreatmentType } from '../../domain/virtual-records/clinical-medication.entity';
import type { ClinicalMedicationService as ClinicalMedicationServiceType } from './clinical-medication.service';

const treatmentType = { OTHER: 'other' as TreatmentType };
mock.module('../../domain/virtual-records', () => ({ TreatmentType: treatmentType }));
let ClinicalMedicationServiceConstructor: typeof import('./clinical-medication.service').ClinicalMedicationService;

const createMedication = (overrides: Partial<ClinicalMedication> = {}): ClinicalMedication => ({
    id: 1,
    mMedication: 'Medication',
    mDosage: 'Dosage instructions',
    mTreatmentType: 'other' as TreatmentType,
    ...overrides,
});

describe('ClinicalMedicationService', () => {
    let service: ClinicalMedicationServiceType;
    let logger: any;
    let repository: any;

    beforeAll(async () => {
        ({ ClinicalMedicationService: ClinicalMedicationServiceConstructor } = await import('./clinical-medication.service'));
    });

    beforeEach(() => {
        logger = {
            error: mock(() => {}),
        };

        repository = {
            create: mock((data: any) => ({ id: 1, ...data })),
            save: mock(async (medication: any) => ({ id: medication.id ?? 1, ...medication })),
            find: mock(async () => []),
            findOne: mock(async () => null),
            remove: mock(async (medication: any) => medication),
        };

        service = new ClinicalMedicationServiceConstructor(logger, repository);
    });

    it('creates a medication and defaults the treatment type to OTHER', async () => {
        const dto: CreateClinicalMedicationDto = {
            mMedication: 'Metformina 850mg',
            mDosage: 'Una tableta cada día',
            idClinicalHistory: 12,
        };
        const saved = createMedication({
            mMedication: dto.mMedication,
            mDosage: dto.mDosage,
            mTreatmentType: treatmentType.OTHER,
            idClinicalHistory: dto.idClinicalHistory,
        });
        repository.save.mockResolvedValue(saved);

        const result = await service.create(dto);

        expect(repository.create).toHaveBeenCalledWith({
            mMedication: dto.mMedication,
            mDosage: dto.mDosage,
            mTreatmentType: treatmentType.OTHER,
            idClinicalHistory: dto.idClinicalHistory,
        });
        expect(repository.save).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ message: 'Clinical medication created successfully', data: saved });
    });

    it('logs and wraps repository errors when creating a medication', async () => {
        repository.save.mockRejectedValue(new Error('database unavailable'));

        await expect(service.create({ mMedication: 'A', mDosage: 'B' })).rejects.toThrow(InternalServerErrorException);

        expect(logger.error).toHaveBeenCalledWith('Error creating clinical medication', expect.any(Object));
    });

    it('returns all medications ordered by id', async () => {
        const medications = [createMedication({ id: 1 }), createMedication({ id: 2 })];
        repository.find.mockResolvedValue(medications);

        const result = await service.findAll();

        expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
        expect(result).toEqual({ message: 'Clinical medications retrieved successfully', data: medications });
    });

    it('filters medications by clinical history and orders them by id', async () => {
        const medications = [createMedication({ id: 3, idClinicalHistory: 42 })];
        repository.find.mockResolvedValue(medications);

        const result = await service.findByClinicalHistory(42);

        expect(repository.find).toHaveBeenCalledWith({
            where: { idClinicalHistory: 42 },
            order: { id: 'ASC' },
        });
        expect(result.data).toEqual(medications);
    });

    it('logs and wraps repository errors when listing medications by history', async () => {
        repository.find.mockRejectedValue(new Error('database unavailable'));

        await expect(service.findByClinicalHistory(42)).rejects.toThrow(InternalServerErrorException);

        expect(logger.error).toHaveBeenCalledWith('Error retrieving clinical medications by history', expect.any(Object));
    });

    it('returns a medication by id', async () => {
        const medication = createMedication({ id: 7, mMedication: 'Insulina' });
        repository.findOne.mockResolvedValue(medication);

        const result = await service.findOne(7);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
        expect(result).toEqual({ message: 'Clinical medication retrieved successfully', data: medication });
    });

    it('throws NotFoundException when the medication does not exist', async () => {
        await expect(service.findOne(404)).rejects.toThrow(NotFoundException);

        expect(logger.error).not.toHaveBeenCalled();
    });

    it('updates and returns an existing medication', async () => {
        const medication = createMedication({ id: 8, mMedication: 'Previous', mDosage: 'Once daily' });
        const updated = createMedication({ ...medication, mMedication: 'Updated' });
        repository.findOne.mockResolvedValue(medication);
        repository.save.mockResolvedValue(updated);

        const result = await service.update(8, { mMedication: 'Updated' });

        expect(repository.save).toHaveBeenCalledWith(updated);
        expect(result).toEqual({ message: 'Clinical medication updated successfully', data: updated });
    });

    it('throws NotFoundException when updating a missing medication', async () => {
        await expect(service.update(404, { mMedication: 'Updated' })).rejects.toThrow(NotFoundException);

        expect(repository.save).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('removes and returns success for an existing medication', async () => {
        const medication = createMedication({ id: 9 });
        repository.findOne.mockResolvedValue(medication);

        const result = await service.remove(9);

        expect(repository.remove).toHaveBeenCalledWith(medication);
        expect(result).toEqual({ message: 'Clinical medication deleted successfully' });
    });

    it('throws NotFoundException when removing a missing medication', async () => {
        await expect(service.remove(404)).rejects.toThrow(NotFoundException);

        expect(repository.remove).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs and wraps repository errors when removing a medication', async () => {
        repository.findOne.mockRejectedValue(new Error('database unavailable'));

        await expect(service.remove(10)).rejects.toThrow(InternalServerErrorException);

        expect(logger.error).toHaveBeenCalledWith('Error deleting clinical medication', expect.any(Object));
    });
});
