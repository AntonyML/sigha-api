import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PsychologyService } from './psychology.service';
import { PsychologySession, SpecializedAppointment, PsychologySessionType, Mood, CognitiveStatus } from '../../domain/nursing';

describe('PsychologyService', () => {
  let service: PsychologyService;
  let psychologyRepository: Repository<PsychologySession>;
  let appointmentRepository: Repository<SpecializedAppointment>;

  const mockPsychologyRepository = {
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
        PsychologyService,
        {
          provide: getRepositoryToken(PsychologySession),
          useValue: mockPsychologyRepository,
        },
        {
          provide: getRepositoryToken(SpecializedAppointment),
          useValue: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<PsychologyService>(PsychologyService);
    psychologyRepository = module.get<Repository<PsychologySession>>(getRepositoryToken(PsychologySession));
    appointmentRepository = module.get<Repository<SpecializedAppointment>>(getRepositoryToken(SpecializedAppointment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPsychologySession', () => {
    it('should create a psychology session successfully', async () => {
      const dto = {
        psy_session_type: PsychologySessionType.THERAPY,
        psy_mood: Mood.STABLE,
        psy_cognitive_status: CognitiveStatus.NORMAL,
        id_appointment: 1,
      };

      const mockAppointment = {
        id: 1,
        area: { saName: 'psychology' },
      };

      const mockSession = { id: 1, ...dto };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockPsychologyRepository.create.mockReturnValue(mockSession);
      mockPsychologyRepository.save.mockResolvedValue(mockSession);

      const result = await service.createPsychologySession(dto);

      expect(result.message).toBe('Psychology session created successfully');
      expect(result.data).toEqual(mockSession);
    });

    it('should throw error if appointment not found', async () => {
      const dto = {
        psy_session_type: PsychologySessionType.EVALUATION,
        psy_mood: Mood.STABLE,
        psy_cognitive_status: CognitiveStatus.NORMAL,
        id_appointment: 1,
      };

      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.createPsychologySession(dto)).rejects.toThrow('Appointment not found');
    });

    it('should throw error if appointment does not belong to psychology', async () => {
      const dto = {
        psy_session_type: PsychologySessionType.EVALUATION,
        psy_mood: Mood.STABLE,
        psy_cognitive_status: CognitiveStatus.NORMAL,
        id_appointment: 1,
      };
      const mockAppointment = {
        id: 1,
        area: { saName: 'nursing' },
      };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.createPsychologySession(dto)).rejects.toThrow('Appointment does not belong to psychology');
    });
  });

  describe('getPsychologySessions', () => {
    it('should return psychology sessions', async () => {
      const mockSessions = [{ id: 1 }];
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockSessions),
      };

      mockPsychologyRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getPsychologySessions();

      expect(result.message).toBe('Psychology sessions retrieved successfully');
      expect(result.data).toEqual(mockSessions);
    });
  });

  describe('getPsychologySessionById', () => {
    it('should return a psychology session by id', async () => {
      const mockSession = { id: 1 };
      mockPsychologyRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.getPsychologySessionById(1);

      expect(result.message).toBe('Psychology session retrieved successfully');
      expect(result.data).toEqual(mockSession);
    });

    it('should throw error if session not found', async () => {
      mockPsychologyRepository.findOne.mockResolvedValue(null);

      await expect(service.getPsychologySessionById(1)).rejects.toThrow('Psychology session not found');
    });
  });

  describe('updatePsychologySession', () => {
    it('should update a psychology session', async () => {
      const dto = { psy_session_type: PsychologySessionType.FOLLOW_UP };
      const mockSession = { id: 1 };
      const updatedSession = { id: 1, psy_session_type: PsychologySessionType.FOLLOW_UP };

      mockPsychologyRepository.findOne.mockResolvedValueOnce(mockSession).mockResolvedValueOnce(updatedSession);
      mockPsychologyRepository.update.mockResolvedValue(undefined);

      const result = await service.updatePsychologySession(1, dto);

      expect(result.message).toBe('Psychology session updated successfully');
      expect(result.data).toEqual(updatedSession);
    });

    it('should throw error if session not found', async () => {
      mockPsychologyRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePsychologySession(1, {})).rejects.toThrow('Psychology session not found');
    });
  });

  describe('deletePsychologySession', () => {
    it('should delete a psychology session', async () => {
      const mockSession = { id: 1 };
      mockPsychologyRepository.findOne.mockResolvedValue(mockSession);
      mockPsychologyRepository.delete.mockResolvedValue(undefined);

      const result = await service.deletePsychologySession(1);

      expect(result.message).toBe('Psychology session deleted successfully');
    });

    it('should throw error if session not found', async () => {
      mockPsychologyRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePsychologySession(1)).rejects.toThrow('Psychology session not found');
    });
  });
});