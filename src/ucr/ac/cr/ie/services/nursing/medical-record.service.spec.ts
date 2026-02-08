import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecord, RecordType, VitalSignsStatus } from '../../domain/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { User } from '../../domain/auth/core';

describe('MedicalRecordService', () => {
  let service: MedicalRecordService;
  let medicalRecordRepository: Repository<MedicalRecord>;
  let patientRepository: Repository<OlderAdult>;
  let userRepository: Repository<User>;

  const mockMedicalRecordRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockPatientRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordService,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: mockMedicalRecordRepository,
        },
        {
          provide: getRepositoryToken(OlderAdult),
          useValue: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MedicalRecordService>(MedicalRecordService);
    medicalRecordRepository = module.get<Repository<MedicalRecord>>(getRepositoryToken(MedicalRecord));
    patientRepository = module.get<Repository<OlderAdult>>(getRepositoryToken(OlderAdult));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMedicalRecord', () => {
    it('should create a medical record successfully', async () => {
      const dto = {
        record_type: RecordType.ROUTINE_CHECK,
        chief_complaint: 'Headache',
        patient_id: 1,
      };

      const mockPatient = { id: 1, name: 'John Doe' };
      const mockUser = { id: 1, username: 'doctor1' };
      const mockRecord = { id: 1, ...dto, patient: mockPatient, created_by: mockUser };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockMedicalRecordRepository.create.mockReturnValue(mockRecord);
      mockMedicalRecordRepository.save.mockResolvedValue(mockRecord);

      const result = await service.createMedicalRecord(dto, 1);

      expect(result.message).toBe('Medical record created successfully');
      expect(result.data).toEqual(mockRecord);
    });

    it('should create a medical record without user', async () => {
      const dto = {
        record_type: RecordType.EMERGENCY,
        diagnosis: 'Acute pain',
        patient_id: 1,
      };

      const mockPatient = { id: 1, name: 'Jane Doe' };
      const mockRecord = { id: 1, ...dto, patient: mockPatient, created_by: null };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockMedicalRecordRepository.create.mockReturnValue(mockRecord);
      mockMedicalRecordRepository.save.mockResolvedValue(mockRecord);

      const result = await service.createMedicalRecord(dto, undefined);

      expect(result.message).toBe('Medical record created successfully');
      expect(result.data.created_by).toBeNull();
    });

    it('should throw error if patient not found', async () => {
      const dto = { record_type: RecordType.ROUTINE_CHECK, patient_id: 1 };

      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.createMedicalRecord(dto, 1)).rejects.toThrow('Patient not found');
    });
  });

  describe('getMedicalRecords', () => {
    it('should return medical records', async () => {
      const mockRecords = [{ id: 1, record_type: RecordType.ROUTINE_CHECK }];
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecords),
      };

      mockMedicalRecordRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getMedicalRecords();

      expect(result.message).toBe('Medical records retrieved successfully');
      expect(result.data).toEqual(mockRecords);
    });

    it('should filter records by patient ID', async () => {
      const mockRecords = [{ id: 1, patient: { id: 1 } }];
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecords),
      };

      mockMedicalRecordRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getMedicalRecords(1);

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('patient.id = :patientId', { patientId: 1 });
      expect(result.data).toEqual(mockRecords);
    });
  });

  describe('getMedicalRecordById', () => {
    it('should return a medical record by id', async () => {
      const mockRecord = { id: 1, record_type: RecordType.ROUTINE_CHECK };
      mockMedicalRecordRepository.findOne.mockResolvedValue(mockRecord);

      const result = await service.getMedicalRecordById(1);

      expect(result.message).toBe('Medical record retrieved successfully');
      expect(result.data).toEqual(mockRecord);
    });

    it('should throw error if record not found', async () => {
      mockMedicalRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.getMedicalRecordById(1)).rejects.toThrow('Medical record not found');
    });
  });

  describe('updateMedicalRecord', () => {
    it('should update a medical record', async () => {
      const dto = { diagnosis: 'Updated diagnosis' };
      const mockRecord = { id: 1, record_type: RecordType.ROUTINE_CHECK };
      const updatedRecord = { id: 1, diagnosis: 'Updated diagnosis' };

      mockMedicalRecordRepository.findOne.mockResolvedValueOnce(mockRecord).mockResolvedValueOnce(updatedRecord);
      mockMedicalRecordRepository.update.mockResolvedValue(undefined);

      const result = await service.updateMedicalRecord(1, dto);

      expect(result.message).toBe('Medical record updated successfully');
      expect(result.data).toEqual(updatedRecord);
    });

    it('should throw error if record not found', async () => {
      mockMedicalRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMedicalRecord(1, { diagnosis: 'Test' })).rejects.toThrow('Medical record not found');
    });
  });

  describe('deleteMedicalRecord', () => {
    it('should delete a medical record', async () => {
      const mockRecord = { id: 1 };
      mockMedicalRecordRepository.findOne.mockResolvedValue(mockRecord);
      mockMedicalRecordRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteMedicalRecord(1);

      expect(result.message).toBe('Medical record deleted successfully');
    });

    it('should throw error if record not found', async () => {
      mockMedicalRecordRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteMedicalRecord(1)).rejects.toThrow('Medical record not found');
    });
  });
});