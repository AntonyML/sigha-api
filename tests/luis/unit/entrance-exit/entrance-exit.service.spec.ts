import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntranceExitService } from '../../../../src/ucr/ac/cr/ie/services/entrances-exits/entrance-exit.service';
import { EntranceExit, EntranceExitType, AccessType } from '../../../../src/ucr/ac/cr/ie/domain/entrances-exits/entrance-exit.entity';
import { CreateEntranceExitDto, CloseCycleDto } from '../../../../src/ucr/ac/cr/ie/dto/entrances-exits';

describe('Entrada y salida ', () => {
  let service: EntranceExitService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntranceExitService,
        {
          provide: 'EntranceExitRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EntranceExitService>(EntranceExitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - Prueba 1', () => {
    it('debería crear un registro de entrada exitosamente', async () => {
      const createDto: CreateEntranceExitDto = {
        eeType: EntranceExitType.EMPLOYEE,
        eeAccessType: AccessType.ENTRANCE,
        eeIdentification: '12345678',
        eeName: 'Michelle',
        eeFLastName: 'Arguedas',
        eeSLastName: 'Murillo',
        eeDatetimeEntrance: '2024-10-26T08:00:00.000Z',
        eeClose: false,
        eeObservations: 'Entrada normal'
      };

      const expectedResult = {
        id: 999, 
        ...createDto,
        eeDatetimeEntrance: new Date('2024-10-26T08:00:00.000Z'),
        createAt: new Date(),
      };

      mockRepository.save.mockResolvedValue({
        id: 999,
        ...createDto,
        eeDatetimeEntrance: new Date('2024-10-26T08:00:00.000Z'),
        createAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(EntranceExit));
      expect(result).toEqual(expectedResult); 
    });
  });

describe('create - Prueba 2', () => {
  it('debería crear un registro de salida exitosamente', async () => {
    const createDto: CreateEntranceExitDto = {
      eeType: EntranceExitType.EMPLOYEE,
      eeAccessType: AccessType.EXIT,
      eeIdentification: '12345678',
      eeName: 'Michelle',
      eeFLastName: 'Arguedas',
      eeSLastName: 'Murillo',
      eeDatetimeExit: '2024-10-26T17:00:00.000Z',
      eeClose: true,
      eeObservations: 'Salida normal'
    };

    const expectedResult = {
      id: 2,
      ...createDto,
      eeDatetimeExit: new Date('2024-10-26T17:00:00.000Z'),
      createAt: new Date(),
    };

    mockRepository.save.mockResolvedValue({
      id: 2, 
      ...createDto,
      eeDatetimeExit: new Date('2024-10-26T17:00:00.000Z'),
      createAt: new Date(),
    });

    const result = await service.create(createDto);

    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(EntranceExit));
    expect(result).toEqual(expectedResult); 
  });
});

  describe('create - Prueba 3', () => {
    it('debería lanzar BadRequestException cuando entrada tiene fecha de salida', async () => {
      const createDto: CreateEntranceExitDto = {
        eeType: EntranceExitType.EMPLOYEE,
        eeAccessType: AccessType.ENTRANCE,
        eeIdentification: '12345678',
        eeName: 'Michelle',
        eeFLastName: 'Arguedas',
        eeSLastName: 'Murillo',
        eeDatetimeEntrance: '2024-10-26T08:00:00.000Z',
        eeDatetimeExit: '2024-10-26T17:00:00.000Z',
        eeClose: false,
        eeObservations: 'Test'
      };

      await expect(service.create(createDto))
        .rejects
        .toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('create - Prueba 4', () => {
    it('debería lanzar BadRequestException cuando salida tiene fecha de entrada', async () => {
      const createDto: CreateEntranceExitDto = {
        eeType: EntranceExitType.EMPLOYEE,
        eeAccessType: AccessType.EXIT,
        eeIdentification: '12345678',
        eeName: 'Michelle',
        eeFLastName: 'Arguedas',
        eeSLastName: 'Murillo',
        eeDatetimeEntrance: '2024-10-26T08:00:00.000Z',
        eeDatetimeExit: '2024-10-26T17:00:00.000Z',
        eeClose: true,
        eeObservations: 'Test'
      };

      await expect(service.create(createDto))
        .rejects
        .toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('create - Prueba 5', () => {
    it('debería usar la fecha actual cuando no se proporciona fecha de entradaaa', async () => {
      const createDto: CreateEntranceExitDto = {
        eeType: EntranceExitType.VISITOR,
        eeAccessType: AccessType.ENTRANCE,
        eeIdentification: '87654321',
        eeName: 'Luis',
        eeFLastName: 'López',
        eeClose: false
      };

      const mockDate = new Date('2024-10-26T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const expectedResult = {
        id: 1,
        ...createDto,
        eeDatetimeEntrance: mockDate,
        createAt: mockDate,
      };

      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result.eeDatetimeEntrance).toEqual(mockDate);
      expect(mockRepository.save).toHaveBeenCalled();

      (global.Date as any).mockRestore();
    });
  });

  describe('closeCycle - Prueba 6', () => {
  it('debería cerrar el ciclo exitosamente', async () => {
    const id = 1;
    const closeCycleDto: CloseCycleDto = {
      eeDatetimeExit: '2024-10-26T17:00:00.000Z',
      eeObservations: 'Ciclo cerrado exitosamente',
      eeClose: true
    };

    const existingRecord = {
      id: 1,
      eeType: EntranceExitType.EMPLOYEE,
      eeAccessType: AccessType.ENTRANCE,
      eeDatetimeEntrance: new Date('2024-10-26T08:00:00.000Z'),
      eeClose: false
    };

    const updatedRecord = {
      ...existingRecord,
      id: 1, 
      eeDatetimeExit: new Date('2024-10-26T17:00:00.000Z'),
      eeClose: true,
      eeObservations: 'Ciclo cerrado exitosamente'
    };

    mockRepository.findOne.mockResolvedValue(existingRecord);
    mockRepository.save.mockResolvedValue(updatedRecord);

    const result = await service.closeCycle(id, closeCycleDto);

    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      eeDatetimeExit: new Date('2024-10-26T17:00:00.000Z'),
      eeClose: true,
      eeObservations: 'Ciclo cerrado exitosamente'
    }));
    expect(result).toEqual(updatedRecord); 
  });
});

  describe('closeCycle - Prueba 7', () => {
    it('debería lanzar NotFoundException cuando el registro no existe', async () => {
      const id = 999;
      const closeCycleDto: CloseCycleDto = {
        eeDatetimeExit: '2024-10-26T17:00:00.000Z',
        eeClose: true
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.closeCycle(id, closeCycleDto))
        .rejects
        .toThrow(NotFoundException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('closeCycle - Prueba 8', () => {
    it('debería lanzar BadRequestException cuando intenta cerrar un ciclo ya cerrado', async () => {
      const id = 1;
      const closeCycleDto: CloseCycleDto = {
        eeDatetimeExit: '2024-10-26T17:00:00.000Z',
        eeClose: true
      };

      const existingRecord = {
        id: 1,
        eeType: EntranceExitType.EMPLOYEE,
        eeClose: true
      };

      mockRepository.findOne.mockResolvedValue(existingRecord);

      await expect(service.closeCycle(id, closeCycleDto))
        .rejects
        .toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getOpenEntrances - Prueba 9', () => {
    it('debería retornar todos los registros de entrada abiertos', async () => {
      const mockRecords = [
        {
          id: 1,
          eeType: EntranceExitType.EMPLOYEE,
          eeAccessType: AccessType.ENTRANCE,
          eeName: 'Michelle',
          eeFLastName: 'Arguedas',
          eeClose: false
        },
        {
          id: 2,
          eeType: EntranceExitType.VISITOR,
          eeAccessType: AccessType.ENTRANCE,
          eeName: 'Luis',
          eeFLastName: 'López',
          eeClose: false
        }
      ];

      mockRepository.find.mockResolvedValue(mockRecords);

      const result = await service.getOpenEntrances();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          eeAccessType: AccessType.ENTRANCE,
          eeClose: false
        },
        order: { eeDatetimeEntrance: 'DESC' }
      });
      expect(result).toEqual(mockRecords);
    });
  });

  describe('remove - Prueba 10', () => {
    it('debería eliminar un registro exitosamente', async () => {
      const id = 1;
      const mockRecord = {
        id: 1,
        eeType: EntranceExitType.EMPLOYEE,
        eeName: 'Luis'
      };

      mockRepository.findOne.mockResolvedValue(mockRecord);
      mockRepository.remove.mockResolvedValue(mockRecord);

      const result = await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockRecord);
      expect(result).toEqual({ success: true });
    });
  });
});