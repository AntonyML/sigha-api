import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SocialWorkService } from './social-work.service';
import { SocialWorkReport, SpecializedAppointment, SpecializedAreaName } from '../../domain/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { User } from '../../domain/auth/core/user.entity';

describe('SocialWorkService', () => {
  let service: SocialWorkService;
  let socialWorkRepository: Repository<SocialWorkReport>;
  let patientRepository: Repository<OlderAdult>;
  let userRepository: Repository<User>;
  let appointmentRepository: Repository<SpecializedAppointment>;

  const mockSocialWorkRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPatientRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAppointmentRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialWorkService,
        {
          provide: getRepositoryToken(SocialWorkReport),
          useValue: mockSocialWorkRepository,
        },
        {
          provide: getRepositoryToken(OlderAdult),
          useValue: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(SpecializedAppointment),
          useValue: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<SocialWorkService>(SocialWorkService);
    socialWorkRepository = module.get<Repository<SocialWorkReport>>(getRepositoryToken(SocialWorkReport));
    patientRepository = module.get<Repository<OlderAdult>>(getRepositoryToken(OlderAdult));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    appointmentRepository = module.get<Repository<SpecializedAppointment>>(getRepositoryToken(SpecializedAppointment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSocialWorkReport', () => {
    it('should create a social work report successfully', async () => {
      const dto = {
        patient_id: 1,
        id_appointment: 1,
        report_type: 'initial assessment' as any,
        social_assessment: 'Patient shows signs of social isolation',
      };
      const userId = 2;
      const mockPatient = { id: 1, name: 'John Doe' };
      const mockUser = { id: 2, name: 'Social Worker' };
      const mockAppointment = { id: 1, area: { saName: SpecializedAreaName.SOCIAL_WORK } };
      const mockReport = { id: 1, ...dto, patient: mockPatient, social_worker: mockUser, id_appointment: mockAppointment };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSocialWorkRepository.create.mockReturnValue(mockReport);
      mockSocialWorkRepository.save.mockResolvedValue(mockReport);

      const result = await service.createSocialWorkReport(dto, userId);

      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.patient_id }
      });
      expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.id_appointment },
        relations: ['area']
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId }
      });
      expect(mockSocialWorkRepository.create).toHaveBeenCalledWith({
        report_date: expect.any(Date),
        report_type: dto.report_type,
        social_assessment: dto.social_assessment,
        family_dynamics: undefined,
        family_support_level: undefined,
        current_living_arrangement: undefined,
        financial_situation: undefined,
        community_resources: undefined,
        social_services_needed: undefined,
        recommendations: undefined,
        action_plan: undefined,
        follow_up_notes: undefined,
        next_follow_up_date: null,
        referrals_made: undefined,
        barriers_identified: undefined,
        strengths_identified: undefined,
        patient: mockPatient,
        social_worker: mockUser,
        id_appointment: mockAppointment,
      });
      expect(result).toEqual({
        message: 'Social work report created successfully',
        data: mockReport
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      const dto = { patient_id: 1, id_appointment: 1, report_type: 'initial assessment' as any };
      const userId = 2;

      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.createSocialWorkReport(dto, userId)).rejects.toThrow('Patient not found');
    });

    it('should throw NotFoundException if appointment not found', async () => {
      const dto = { patient_id: 1, id_appointment: 1, report_type: 'initial assessment' as any };
      const userId = 2;
      const mockPatient = { id: 1, name: 'John Doe' };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.createSocialWorkReport(dto, userId)).rejects.toThrow('Appointment not found');
    });

    it('should throw BadRequestException if appointment does not belong to social work', async () => {
      const dto = { patient_id: 1, id_appointment: 1, report_type: 'initial assessment' as any };
      const userId = 2;
      const mockPatient = { id: 1, name: 'John Doe' };
      const mockAppointment = { id: 1, area: { saName: SpecializedAreaName.NURSING } };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.createSocialWorkReport(dto, userId)).rejects.toThrow('Appointment does not belong to social work');
    });

    it('should create report with null social_worker if user not found', async () => {
      const dto = {
        patient_id: 1,
        id_appointment: 1,
        report_type: 'initial assessment' as any,
        social_assessment: 'Patient assessment',
      };
      const userId = 2;
      const mockPatient = { id: 1, name: 'John Doe' };
      const mockAppointment = { id: 1, area: { saName: SpecializedAreaName.SOCIAL_WORK } };
      const mockReport = { id: 1, ...dto, patient: mockPatient, social_worker: null, id_appointment: mockAppointment };

      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockSocialWorkRepository.create.mockReturnValue(mockReport);
      mockSocialWorkRepository.save.mockResolvedValue(mockReport);

      const result = await service.createSocialWorkReport(dto, userId);

      expect(mockSocialWorkRepository.create).toHaveBeenCalledWith({
        report_date: expect.any(Date),
        report_type: dto.report_type,
        social_assessment: dto.social_assessment,
        family_dynamics: undefined,
        family_support_level: undefined,
        current_living_arrangement: undefined,
        financial_situation: undefined,
        community_resources: undefined,
        social_services_needed: undefined,
        recommendations: undefined,
        action_plan: undefined,
        follow_up_notes: undefined,
        next_follow_up_date: null,
        referrals_made: undefined,
        barriers_identified: undefined,
        strengths_identified: undefined,
        patient: mockPatient,
        social_worker: null,
        id_appointment: mockAppointment,
      });
      expect(result.data.social_worker).toBeNull();
    });
  });

  describe('getSocialWorkReports', () => {
    it('should return all reports if no patientId provided', async () => {
      const mockReports = [
        { id: 1, report_type: 'initial assessment' },
        { id: 2, report_type: 'follow up' },
      ];

      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReports),
        getOne: jest.fn(),
      };

      mockSocialWorkRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getSocialWorkReports();

      expect(mockSocialWorkRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('report.patient', 'patient');
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('report.social_worker', 'social_worker');
      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('report.id_appointment', 'appointment');
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('report.report_date', 'DESC');
      expect(result).toEqual({
        message: 'Social work reports retrieved successfully',
        data: mockReports
      });
    });

    it('should filter reports by patientId', async () => {
      const patientId = 1;
      const mockReports = [{ id: 1, report_type: 'initial assessment', patient: { id: patientId } }];

      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReports),
        getOne: jest.fn().mockResolvedValue(mockReports[0]),
      };
      mockSocialWorkRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.getSocialWorkReports(patientId);

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('patient.id = :patientId', { patientId });
      expect(result).toEqual({
        message: 'Social work reports retrieved successfully',
        data: mockReports
      });
    });
  });

  describe('getSocialWorkReportById', () => {
    it('should return report by id', async () => {
      const id = 1;
      const mockReport = { id, report_type: 'initial assessment' };

      mockSocialWorkRepository.findOne.mockResolvedValue(mockReport);

      const result = await service.getSocialWorkReportById(id);

      expect(mockSocialWorkRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['patient', 'social_worker', 'id_appointment']
      });
      expect(result).toEqual({
        message: 'Social work report retrieved successfully',
        data: mockReport
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      const id = 1;

      mockSocialWorkRepository.findOne.mockResolvedValue(null);

      await expect(service.getSocialWorkReportById(id)).rejects.toThrow('Social work report not found');
    });
  });

  describe('updateSocialWorkReport', () => {
    it('should update report successfully', async () => {
      const id = 1;
      const updateDto = { social_assessment: 'Updated assessment', id_appointment: 2 };
      const mockReport = { id, report_type: 'initial assessment', social_assessment: 'Original assessment', id_appointment: { id: 1, area: { saName: SpecializedAreaName.SOCIAL_WORK } } };
      const mockAppointment = { id: 2, area: { saName: SpecializedAreaName.SOCIAL_WORK } };
      const updatedReport = { ...mockReport, social_assessment: 'Updated assessment', id_appointment: mockAppointment };

      mockSocialWorkRepository.findOne.mockResolvedValueOnce(mockReport);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockSocialWorkRepository.update.mockResolvedValue({ affected: 1 });
      mockSocialWorkRepository.findOne.mockResolvedValueOnce(updatedReport);

      const result = await service.updateSocialWorkReport(id, updateDto);

      expect(mockSocialWorkRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['patient', 'social_worker', 'id_appointment']
      });
      expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
        relations: ['area']
      });
      expect(mockSocialWorkRepository.update).toHaveBeenCalledWith(id, { social_assessment: 'Updated assessment', id_appointment: mockAppointment });
      expect(result).toEqual({
        message: 'Social work report updated successfully',
        data: updatedReport
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      const id = 1;
      const updateDto = { social_assessment: 'Updated assessment' };

      mockSocialWorkRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSocialWorkReport(id, updateDto)).rejects.toThrow('Social work report not found');
    });

    it('should throw BadRequestException if appointment does not belong to social work in update', async () => {
      const id = 1;
      const updateDto = { social_assessment: 'Updated assessment', id_appointment: 2 };
      const mockReport = { id, report_type: 'initial assessment', social_assessment: 'Original assessment' };
      const mockAppointment = { id: 2, area: { saName: SpecializedAreaName.NURSING } };

      mockSocialWorkRepository.findOne.mockResolvedValue(mockReport);
      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.updateSocialWorkReport(id, updateDto)).rejects.toThrow('Appointment does not belong to social work');
    });
  });

  describe('deleteSocialWorkReport', () => {
    it('should delete report successfully', async () => {
      const id = 1;
      const mockReport = { id, report_type: 'initial assessment' };

      mockSocialWorkRepository.findOne.mockResolvedValue(mockReport);
      mockSocialWorkRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteSocialWorkReport(id);

      expect(mockSocialWorkRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockSocialWorkRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        message: 'Social work report deleted successfully'
      });
    });

    it('should throw NotFoundException if report not found', async () => {
      const id = 1;

      mockSocialWorkRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteSocialWorkReport(id)).rejects.toThrow('Social work report not found');
    });
  });
});