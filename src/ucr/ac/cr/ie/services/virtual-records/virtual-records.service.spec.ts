import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { VirtualRecordsService } from './virtual-records.service';

describe('VirtualRecordsService - Optimización N+1', () => {
    let service: VirtualRecordsService;
    let logger: any;
    let programRepository: any;
    let subProgramRepository: any;
    let olderAdultRepository: any;
    let familyRepository: any;
    let clinicalHistoryRepository: any;
    let clinicalConditionRepository: any;
    let vaccineRepository: any;
    let medicationRepository: any;
    let historyConditionRepository: any;
    let historyVaccineRepository: any;
    let olderAdultSubprogramRepository: any;
    let olderAdultUpdateRepository: any;
    let dataSource: any;

    beforeEach(() => {
        logger = { error: mock(() => {}), log: mock(() => {}), warn: mock(() => {}) };
        programRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        subProgramRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        olderAdultRepository = {
            find: mock(async () => []),
            findOne: mock(async () => null),
            createQueryBuilder: mock(() => ({
                where: mock().mockReturnThis(),
                orWhere: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                getMany: mock(async () => []),
            })),
        };
        familyRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        clinicalHistoryRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        clinicalConditionRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        vaccineRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        medicationRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        historyConditionRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        historyVaccineRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        olderAdultSubprogramRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        olderAdultUpdateRepository = { find: mock(async () => []), findOne: mock(async () => null) };
        dataSource = { createQueryRunner: mock() };

        service = new VirtualRecordsService(
            logger,
            programRepository,
            subProgramRepository,
            olderAdultRepository,
            familyRepository,
            clinicalHistoryRepository,
            clinicalConditionRepository,
            vaccineRepository,
            medicationRepository,
            historyConditionRepository,
            historyVaccineRepository,
            olderAdultSubprogramRepository,
            olderAdultUpdateRepository,
            dataSource,
        );
    });

    it('getAllVirtualRecords devuelve lista vacía si no hay adultos mayores sin disparar queries secundarias', async () => {
        olderAdultRepository.find.mockResolvedValue([]);

        const result = await service.getAllVirtualRecords();

        expect(result).toEqual({
            message: 'Found 0 virtual record(s)',
            data: [],
        });
        expect(olderAdultRepository.find).toHaveBeenCalledTimes(1);
        expect(programRepository.find).toHaveBeenCalledTimes(0);
        expect(familyRepository.find).toHaveBeenCalledTimes(0);
        expect(olderAdultSubprogramRepository.find).toHaveBeenCalledTimes(0);
        expect(clinicalHistoryRepository.find).toHaveBeenCalledTimes(0);
    });

    it('getAllVirtualRecords hidrata en lotes evitando N+1 consultas individuales', async () => {
        const mockAdults = [
            {
                id: 1,
                oaIdentification: '1-1111-1111',
                oaName: 'Juan',
                oaFLastName: 'Perez',
                oaSLastName: 'Mora',
                oaBirthdate: new Date('1940-01-01'),
                oaGender: 'male',
                oaPhoneNumber: '8888-1111',
                oaEmail: 'juan@test.com',
                oaDwelling: 'San Jose',
                oaStatus: 'alive',
                oaMaritalStatus: 'single',
                oaYearsSchooling: 'primary',
                oaPreviousWork: 'Agricultor',
                oaIsRetired: true,
                oaHasPension: true,
                oaOther: false,
                oaOtherDescription: null,
                oaProvince: 'San Jose',
                oaCanton: 'Central',
                oaDistrict: 'Carmen',
                oaChildrenCount: 2,
                oaDeathDate: null,
                oaEconomicIncome: 100000,
                oaProfilePhotoUrl: null,
                oaBloodType: 'O+',
                createAt: new Date('2024-01-01'),
                idProgram: 10,
                idFamily: 20,
            },
            {
                id: 2,
                oaIdentification: '2-2222-2222',
                oaName: 'Maria',
                oaFLastName: 'Gomez',
                oaSLastName: 'Solano',
                oaBirthdate: new Date('1945-05-10'),
                oaGender: 'female',
                oaPhoneNumber: '8888-2222',
                oaEmail: 'maria@test.com',
                oaDwelling: 'Cartago',
                oaStatus: 'alive',
                oaMaritalStatus: 'married',
                oaYearsSchooling: 'secondary',
                oaPreviousWork: 'Costurera',
                oaIsRetired: true,
                oaHasPension: true,
                oaOther: false,
                oaOtherDescription: null,
                oaProvince: 'Cartago',
                oaCanton: 'Central',
                oaDistrict: 'Oriental',
                oaChildrenCount: 3,
                oaDeathDate: null,
                oaEconomicIncome: 120000,
                oaProfilePhotoUrl: null,
                oaBloodType: 'A+',
                createAt: new Date('2024-01-02'),
                idProgram: 10,
                idFamily: null,
            },
        ];

        olderAdultRepository.find.mockResolvedValue(mockAdults);
        programRepository.find.mockResolvedValue([
            { id: 10, pName: 'Programa A', createAt: new Date('2023-01-01') },
        ]);
        familyRepository.find.mockResolvedValue([
            {
                id: 20,
                pfIdentification: '1-9999-9999',
                pfName: 'Carlos',
                pfFLastName: 'Perez',
                pfSLastName: 'Mora',
                pfPhoneNumber: '8888-3333',
                pfEmail: 'carlos@test.com',
                pfKinship: 'son',
                createAt: new Date('2024-01-01'),
            },
        ]);
        olderAdultSubprogramRepository.find.mockResolvedValue([
            { id: 1, idOlderAdult: 1, idSubProgram: 100 },
        ]);
        subProgramRepository.find.mockResolvedValue([
            { id: 100, spName: 'Subprograma 1', idProgram: 10 },
        ]);
        clinicalHistoryRepository.find.mockResolvedValue([
            {
                id: 50,
                idOlderAdult: 1,
                chObservations: 'Estable',
                chFrequentFalls: false,
                chWeight: 65,
                chHeight: 165,
                chImc: 23.8,
                chBloodPressure: '120/80',
                chNeoplasms: false,
                chNeoplasmsDescription: null,
                chRcvg: 'bajo',
                chVisionProblems: false,
                chVisionHearing: false,
                createAt: new Date('2024-01-01'),
            },
        ]);
        historyConditionRepository.find.mockResolvedValue([
            { id: 1, idCHistory: 50, idCCondition: 200 },
        ]);
        clinicalConditionRepository.find.mockResolvedValue([
            { id: 200, ccName: 'HTA' },
        ]);
        historyVaccineRepository.find.mockResolvedValue([
            { id: 1, idCHistory: 50, idVaccine: 300 },
        ]);
        vaccineRepository.find.mockResolvedValue([
            { id: 300, vName: 'Influenza' },
        ]);
        medicationRepository.find.mockResolvedValue([
            {
                id: 400,
                idClinicalHistory: 50,
                mMedication: 'Losartan',
                mDosage: '50mg',
                mTreatmentType: 'chronic',
            },
        ]);

        const result = await service.getAllVirtualRecords();

        expect(result.message).toBe('Found 2 virtual record(s)');
        expect(result.data).toHaveLength(2);

        // Verificación de llamadas en lote (1 sola vez por repositorio con In())
        expect(olderAdultRepository.find).toHaveBeenCalledTimes(1);
        expect(programRepository.find).toHaveBeenCalledTimes(1);
        expect(familyRepository.find).toHaveBeenCalledTimes(1);
        expect(olderAdultSubprogramRepository.find).toHaveBeenCalledTimes(1);
        expect(subProgramRepository.find).toHaveBeenCalledTimes(1);
        expect(clinicalHistoryRepository.find).toHaveBeenCalledTimes(1);
        expect(historyConditionRepository.find).toHaveBeenCalledTimes(1);
        expect(clinicalConditionRepository.find).toHaveBeenCalledTimes(1);
        expect(historyVaccineRepository.find).toHaveBeenCalledTimes(1);
        expect(vaccineRepository.find).toHaveBeenCalledTimes(1);
        expect(medicationRepository.find).toHaveBeenCalledTimes(1);

        // Validación de datos ensamblados para el primer adulto
        const adult1 = result.data[0];
        expect(adult1.id).toBe(1);
        expect(adult1.oaAddress).toBe('San Jose');
        expect(adult1.program).toEqual({
            id: 10,
            pName: 'Programa A',
            createAt: expect.any(Date),
            subPrograms: [{ id: 100, spName: 'Subprograma 1', idProgram: 10 }],
        });
        expect(adult1.family).toEqual({
            id: 20,
            pfIdentification: '1-9999-9999',
            pfName: 'Carlos',
            pfFLastName: 'Perez',
            pfSLastName: 'Mora',
            pfPhoneNumber: '8888-3333',
            pfEmail: 'carlos@test.com',
            pfKinship: 'son',
            createAt: expect.any(Date),
            emergencyContacts: [],
        });
        expect(adult1.clinicalHistory.conditions).toEqual([{ id: 200, ccName: 'HTA' }]);
        expect(adult1.clinicalHistory.vaccines).toEqual([{ id: 300, vName: 'Influenza' }]);
        expect(adult1.clinicalHistory.medications).toEqual([
            {
                id: 400,
                mMedication: 'Losartan',
                mDosage: '50mg',
                mTreatmentType: 'chronic',
                mStartDate: null,
                mObservations: null,
            },
        ]);

        // Validación para el segundo adulto (sin familia ni historia clínica)
        const adult2 = result.data[1];
        expect(adult2.id).toBe(2);
        expect(adult2.family).toBeNull();
        expect(adult2.clinicalHistory).toBeNull();
        expect(adult2.program?.pName).toBe('Programa A');
    });

    it('searchVirtualRecords hidrata en lotes los resultados del queryBuilder', async () => {
        const mockAdults = [
            {
                id: 3,
                oaIdentification: '3-3333-3333',
                oaName: 'Carlos',
                oaFLastName: 'Vargas',
                oaDwelling: 'Alajuela',
                idProgram: null,
                idFamily: null,
                createAt: new Date('2024-02-01'),
            },
        ];

        const queryBuilderMock = {
            where: mock().mockReturnThis(),
            orWhere: mock().mockReturnThis(),
            orderBy: mock().mockReturnThis(),
            getMany: mock(async () => mockAdults),
        };
        olderAdultRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

        const result = await service.searchVirtualRecords({ search: 'Carlos' });

        expect(result.message).toBe('Found 1 virtual record(s) matching "Carlos"');
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(3);
        expect(result.data[0].oaAddress).toBe('Alajuela');
    });

    it('getVirtualRecordById devuelve el registro hidratado para un ID existente', async () => {
        olderAdultRepository.findOne.mockResolvedValue({
            id: 5,
            oaIdentification: '5-5555-5555',
            oaName: 'Pedro',
            oaFLastName: 'Alvarado',
            oaDwelling: 'Heredia',
            idProgram: null,
            idFamily: null,
            createAt: new Date('2024-03-01'),
        });

        const result = await service.getVirtualRecordById(5);

        expect(result.message).toBe('Virtual record found successfully');
        expect(result.data.id).toBe(5);
        expect(result.data.oaName).toBe('Pedro');
        expect(result.data.oaAddress).toBe('Heredia');
    });

    it('getVirtualRecordById lanza NotFoundException si no existe el registro', async () => {
        olderAdultRepository.findOne.mockResolvedValue(null);

        expect(service.getVirtualRecordById(99)).rejects.toThrow(NotFoundException);
    });
});
