import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VirtualRecordsService } from './virtual-records.service';
import { CreateVirtualRecordDirectDto, UpdateVirtualRecordDirectDto, SearchVirtualRecordsDto } from '../../dto/virtual-records';
import { MaritalStatus, YearsSchooling, Gender, BloodType, KinshipType, OlderAdultStatus, TreatmentType } from '../../domain/virtual-records';

describe('VirtualRecordsService', () => {
  let service: VirtualRecordsService;
  let mockProgramRepository: any;
  let mockSubProgramRepository: any;
  let mockOlderAdultRepository: any;
  let mockFamilyRepository: any;
  let mockClinicalHistoryRepository: any;
  let mockClinicalConditionRepository: any;
  let mockVaccineRepository: any;
  let mockClinicalMedicationRepository: any;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    mockProgramRepository = {
      findOne: jest.fn(),
    };

    mockSubProgramRepository = {
      findOne: jest.fn(),
    };

    mockOlderAdultRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
      }),
    };

    mockFamilyRepository = {
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    mockClinicalHistoryRepository = {
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockClinicalConditionRepository = {
      findOne: jest.fn(),
    };

    mockVaccineRepository = {
      findOne: jest.fn(),
    };

    mockClinicalMedicationRepository = {
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VirtualRecordsService,
        {
          provide: 'ProgramRepository',
          useValue: mockProgramRepository,
        },
        {
          provide: 'SubProgramRepository',
          useValue: mockSubProgramRepository,
        },
        {
          provide: 'OlderAdultRepository',
          useValue: mockOlderAdultRepository,
        },
        {
          provide: 'OlderAdultFamilyRepository',
          useValue: mockFamilyRepository,
        },
        {
          provide: 'ClinicalHistoryRepository',
          useValue: mockClinicalHistoryRepository,
        },
        {
          provide: 'ClinicalConditionRepository',
          useValue: mockClinicalConditionRepository,
        },
        {
          provide: 'VaccineRepository',
          useValue: mockVaccineRepository,
        },
        {
          provide: 'ClinicalMedicationRepository',
          useValue: mockClinicalMedicationRepository,
        },
        {
          provide: 'ClinicalHistoryAndConditionRepository',
          useValue: { save: jest.fn(), create: jest.fn(), remove: jest.fn() },
        },
        {
          provide: 'VaccinesAndClinicalHistoryRepository',
          useValue: { save: jest.fn(), create: jest.fn(), remove: jest.fn() },
        },
        {
          provide: 'OlderAdultSubprogramRepository',
          useValue: { save: jest.fn(), create: jest.fn(), remove: jest.fn(), find: jest.fn() },
        },
        {
          provide: 'DataSource',
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<VirtualRecordsService>(VirtualRecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVirtualRecordDirect', () => {
    const mockCreateDto = {
      oa_identification: '123456789',
      oa_name: 'Juan',
      oa_f_last_name: 'Pérez'
    } as CreateVirtualRecordDirectDto;

    it('should create a virtual record successfully', async () => {
      const mockOlderAdult = {
        id: 1,
        ...mockCreateDto,
        createAt: new Date(),
        updateAt: new Date()
      };

      mockOlderAdultRepository.findOne.mockResolvedValue(null); // No existe
      mockQueryRunner.manager.save.mockResolvedValue(mockOlderAdult);

      const result = await service.createVirtualRecordDirect(mockCreateDto);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledWith({
        where: { oaIdentification: mockCreateDto.oa_identification }
      });
      expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(result.message).toBe('Virtual record created successfully');
      expect(result.data).toEqual(mockOlderAdult);
    });

    it('should throw ConflictException when older adult already exists', async () => {
      const existingOlderAdult = {
        id: 1,
        oaIdentification: mockCreateDto.oa_identification
      };

      mockOlderAdultRepository.findOne.mockResolvedValue(existingOlderAdult);

      await expect(service.createVirtualRecordDirect(mockCreateDto))
        .rejects
        .toThrow(ConflictException);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledWith({
        where: { oaIdentification: mockCreateDto.oa_identification }
      });
      expect(mockDataSource.createQueryRunner).not.toHaveBeenCalled();
    });
  });

  describe('updateVirtualRecordDirect', () => {
    const mockUpdateDto = {
      id: 1,
      oa_identification: '123456789',
      oa_name: 'Juan Carlos',
      oa_f_last_name: 'Pérez'
    } as UpdateVirtualRecordDirectDto;

    it('should throw NotFoundException when older adult does not exist', async () => {
      mockOlderAdultRepository.findOne.mockResolvedValue(null);

      await expect(service.updateVirtualRecordDirect(mockUpdateDto))
        .rejects
        .toThrow(NotFoundException);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUpdateDto.id }
      });
    });

    it('should throw ConflictException when identification conflicts with another record', async () => {
      const existingOlderAdult = {
        id: 1,
        oaIdentification: '111111111', // Identificación diferente
      };

      const conflictingRecord = {
        id: 2,
        oaIdentification: '123456789', // Conflicto con la nueva identificación
      };

      mockOlderAdultRepository.findOne
        .mockResolvedValueOnce(existingOlderAdult) // Primera llamada: registro existente
        .mockResolvedValueOnce(conflictingRecord); // Segunda llamada: conflicto

      await expect(service.updateVirtualRecordDirect(mockUpdateDto))
        .rejects
        .toThrow(ConflictException);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllVirtualRecords', () => {
    it('should return empty array when no records exist', async () => {
      mockOlderAdultRepository.find.mockResolvedValue([]);

      const result = await service.getAllVirtualRecords();

      expect(result.message).toBe('Found 0 virtual record(s)');
      expect(result.data).toEqual([]);
    });
  });

  describe('getVirtualRecordById', () => {
    it('should throw NotFoundException when record does not exist', async () => {
      const id = 999;
      mockOlderAdultRepository.findOne.mockResolvedValue(null);

      await expect(service.getVirtualRecordById(id))
        .rejects
        .toThrow(NotFoundException);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledWith({
        where: { id: id }
      });
    });
  });

  describe('deleteVirtualRecord', () => {
    it('should throw NotFoundException when trying to delete non-existent record', async () => {
      const id = 999;
      mockOlderAdultRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteVirtualRecord(id))
        .rejects
        .toThrow(NotFoundException);

      expect(mockOlderAdultRepository.findOne).toHaveBeenCalledWith({
        where: { id: id }
      });
    });
  });

  describe('searchVirtualRecords', () => {
    const mockSearchDto: SearchVirtualRecordsDto = {
      search: 'Juan Pérez'
    };

    it('should return empty array when no matches found', async () => {
      const mockQueryBuilder = mockOlderAdultRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.searchVirtualRecords(mockSearchDto);

      expect(result.message).toBe('Found 0 virtual record(s) matching "Juan Pérez"');
      expect(result.data).toEqual([]);
    });
  });
});