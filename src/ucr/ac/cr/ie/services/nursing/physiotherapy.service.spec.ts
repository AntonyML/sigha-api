import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhysiotherapyService } from '../../../src/ucr/ac/cr/ie/services/nursing/physiotherapy.service';
import { PhysiotherapySession } from '../../../src/ucr/ac/cr/ie/domain/nursing';
import { SpecializedAppointment } from '../../../src/ucr/ac/cr/ie/domain/nursing';

describe('PhysiotherapyService', () => {
  let service: PhysiotherapyService;
  let physiotherapyRepository: Repository<PhysiotherapySession>;
  let appointmentRepository: Repository<SpecializedAppointment>;

  const mockPhysiotherapyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockAppointmentRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysiotherapyService,
        {
          provide: getRepositoryToken(PhysiotherapySession),
          useValue: mockPhysiotherapyRepository,
        },
        {
          provide: getRepositoryToken(SpecializedAppointment),
          useValue: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<PhysiotherapyService>(PhysiotherapyService);
    physiotherapyRepository = module.get<Repository<PhysiotherapySession>>(getRepositoryToken(PhysiotherapySession));
    appointmentRepository = module.get<Repository<SpecializedAppointment>>(getRepositoryToken(SpecializedAppointment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPhysiotherapySession', () => {
    it('should create a physiotherapy session successfully', async () => {
      const dto = {
        ps_type: 'therapy',
        ps_mobility_level: 'moderate',
        id_appointment: 1,
      };

      const mockAppointment = {
        id: 1,
        area: { saName: 'physiotherapy' },
      };

      const mockSession = { id: 1, ...dto };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockPhysiotherapyRepository.create.mockReturnValue(mockSession);
      mockPhysiotherapyRepository.save.mockResolvedValue(mockSession);

      const result = await service.createPhysiotherapySession(dto);

      expect(result.message).toBe('Physiotherapy session created successfully');
      expect(result.data).toEqual(mockSession);
    });

    it('should throw error if appointment not found', async () => {
      const dto = { id_appointment: 1 };

      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.createPhysiotherapySession(dto)).rejects.toThrow('Appointment not found');
    });

    it('should throw error if appointment does not belong to physiotherapy', async () => {
      const dto = { id_appointment: 1 };
      const mockAppointment = {
        id: 1,
        area: { saName: 'nursing' },
      };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.createPhysiotherapySession(dto)).rejects.toThrow('Appointment does not belong to physiotherapy');
    });
  });

  describe('getPhysiotherapySessions', () => {
    it('should return physiotherapy sessions', async () => {
      const mockSessions = [{ id: 1 }];
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSessions),
      };

      mockPhysiotherapyRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getPhysiotherapySessions();

      expect(result.message).toBe('Physiotherapy sessions retrieved successfully');
      expect(result.data).toEqual(mockSessions);
    });
  });

  describe('getPhysiotherapySessionById', () => {
    it('should return a physiotherapy session by id', async () => {
      const mockSession = { id: 1 };
      mockPhysiotherapyRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.getPhysiotherapySessionById(1);

      expect(result.message).toBe('Physiotherapy session retrieved successfully');
      expect(result.data).toEqual(mockSession);
    });

    it('should throw error if session not found', async () => {
      mockPhysiotherapyRepository.findOne.mockResolvedValue(null);

      await expect(service.getPhysiotherapySessionById(1)).rejects.toThrow('Physiotherapy session not found');
    });
  });

  describe('updatePhysiotherapySession', () => {
    it('should update a physiotherapy session', async () => {
      const dto = { ps_type: 'follow_up' };
      const mockSession = { id: 1 };
      const updatedSession = { id: 1, ps_type: 'follow_up' };

      mockPhysiotherapyRepository.findOne.mockResolvedValueOnce(mockSession).mockResolvedValueOnce(updatedSession);
      mockPhysiotherapyRepository.update.mockResolvedValue(undefined);

      const result = await service.updatePhysiotherapySession(1, dto);

      expect(result.message).toBe('Physiotherapy session updated successfully');
      expect(result.data).toEqual(updatedSession);
    });

    it('should throw error if session not found', async () => {
      mockPhysiotherapyRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePhysiotherapySession(1, {})).rejects.toThrow('Physiotherapy session not found');
    });
  });

  describe('deletePhysiotherapySession', () => {
    it('should delete a physiotherapy session', async () => {
      const mockSession = { id: 1 };
      mockPhysiotherapyRepository.findOne.mockResolvedValue(mockSession);
      mockPhysiotherapyRepository.delete.mockResolvedValue(undefined);

      const result = await service.deletePhysiotherapySession(1);

      expect(result.message).toBe('Physiotherapy session deleted successfully');
    });

    it('should throw error if session not found', async () => {
      mockPhysiotherapyRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePhysiotherapySession(1)).rejects.toThrow('Physiotherapy session not found');
    });
  });
});