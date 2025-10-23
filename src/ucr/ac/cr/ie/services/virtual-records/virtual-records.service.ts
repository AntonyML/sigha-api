import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import {
    Program,
    SubProgram,
    OlderAdult,
    OlderAdultFamily,
    ClinicalHistory,
    ClinicalCondition,
    Vaccine,
    ClinicalMedication,
    ClinicalHistoryAndCondition,
    VaccinesAndClinicalHistory,
    OlderAdultSubprogram,
    MaritalStatus,
    YearsSchooling,
    Gender,
    BloodType,
    KinshipType,
    TreatmentType,
    RcvgType,
    OlderAdultStatus
} from '../../domain/virtual-records';
import { CreateVirtualRecordDirectDto } from '../../dto/virtual-records';

@Injectable()
export class VirtualRecordsService {
    constructor(
        @Inject('ProgramRepository')
        private readonly programRepository: Repository<Program>,
        
        @Inject('SubProgramRepository')
        private readonly subProgramRepository: Repository<SubProgram>,
        
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<OlderAdult>,
        
        @Inject('OlderAdultFamilyRepository')
        private readonly familyRepository: Repository<OlderAdultFamily>,
        
        @Inject('ClinicalHistoryRepository')
        private readonly clinicalHistoryRepository: Repository<ClinicalHistory>,
        
        @Inject('ClinicalConditionRepository')
        private readonly clinicalConditionRepository: Repository<ClinicalCondition>,
        
        @Inject('VaccineRepository')
        private readonly vaccineRepository: Repository<Vaccine>,
        
        @Inject('ClinicalMedicationRepository')
        private readonly medicationRepository: Repository<ClinicalMedication>,
        
        @Inject('ClinicalHistoryAndConditionRepository')
        private readonly historyConditionRepository: Repository<ClinicalHistoryAndCondition>,
        
        @Inject('VaccinesAndClinicalHistoryRepository')
        private readonly historyVaccineRepository: Repository<VaccinesAndClinicalHistory>,
        
        @Inject('OlderAdultSubprogramRepository')
        private readonly olderAdultSubprogramRepository: Repository<OlderAdultSubprogram>,
        
        @Inject('DataSource')
        private readonly dataSource: DataSource
    ) {}



    async createVirtualRecordDirect(createDto: CreateVirtualRecordDirectDto): Promise<{ message: string; data: OlderAdult }> {
        // Check if older adult already exists
        const existingOlderAdult = await this.olderAdultRepository.findOne({
            where: { oaIdentification: createDto.oa_identification }
        });

        if (existingOlderAdult) {
            throw new ConflictException('An older adult with this identification already exists');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Handle Program - first try to find existing program
            let program: Program;
            if (createDto.program?.id) {
                program = await queryRunner.manager.findOne(Program, {
                    where: { id: createDto.program.id }
                });
                if (!program) {
                    throw new NotFoundException(`Program with ID ${createDto.program.id} not found`);
                }
            } else {
                // Create a default program if none specified
                program = new Program(undefined, 'General Program');
                program = await queryRunner.manager.save(Program, program);
            }

            // 2. Handle Family (optional)
            let family: OlderAdultFamily | undefined;
            if (createDto.family && createDto.family.pf_identification) {
                // Check if family member already exists
                family = await queryRunner.manager.findOne(OlderAdultFamily, {
                    where: { pfIdentification: createDto.family.pf_identification }
                });

                if (!family) {
                    family = new OlderAdultFamily(
                        undefined,
                        createDto.family.pf_identification,
                        createDto.family.pf_name,
                        createDto.family.pf_f_last_name,
                        createDto.family.pf_s_last_name,
                        createDto.family.pf_phone_number,
                        createDto.family.pf_email,
                        createDto.family.pf_kinship as KinshipType
                    );
                    family = await queryRunner.manager.save(OlderAdultFamily, family);
                }
            }

            // 3. Create Older Adult
            const olderAdult = new OlderAdult(
                undefined,
                createDto.oa_identification,
                createDto.oa_name,
                createDto.oa_f_last_name,
                createDto.oa_previous_work,
                createDto.oa_s_last_name,
                createDto.oa_birthdate ? new Date(createDto.oa_birthdate) : undefined,
                createDto.oa_marital_status as MaritalStatus,
                createDto.oa_dwelling,
                createDto.oa_years_schooling as YearsSchooling,
                createDto.oa_is_retired,
                createDto.oa_has_pension,
                createDto.oa_other,
                createDto.oa_other_description,
                createDto.oa_area_of_origin,
                createDto.oa_children_count,
                createDto.oa_status as OlderAdultStatus,
                createDto.oa_death_date ? new Date(createDto.oa_death_date) : undefined,
                createDto.oa_economic_income,
                createDto.oa_phone_numner, // Note: there's a typo in the entity (numner instead of number)
                createDto.oa_email,
                createDto.oa_profile_photo_url,
                createDto.oa_gender as Gender,
                createDto.oa_blood_type as BloodType,
                undefined, // createAt defaults to now
                program.id,
                family?.id
            );

            const savedOlderAdult = await queryRunner.manager.save(OlderAdult, olderAdult);

            // 4. Handle Sub-programs - Solo si el programa es "Hogar larga instancia"
            if (createDto.program?.sub_programs?.length > 0) {
                for (const subProgramRef of createDto.program.sub_programs) {
                    const subProgram = await queryRunner.manager.findOne(SubProgram, {
                        where: { id: subProgramRef.id }
                    });

                    if (subProgram) {
                        const olderAdultSubprogram = new OlderAdultSubprogram(
                            savedOlderAdult.id,
                            subProgram.id
                        );
                        await queryRunner.manager.save(OlderAdultSubprogram, olderAdultSubprogram);
                    }
                }
            }

            // 5. Handle Clinical History (optional)
            if (createDto.clinical_history) {
                const clinicalHistory = new ClinicalHistory(
                    undefined,
                    createDto.clinical_history.ch_frequent_falls,
                    createDto.clinical_history.ch_weight,
                    createDto.clinical_history.ch_height,
                    createDto.clinical_history.ch_imc,
                    createDto.clinical_history.ch_blood_pressure,
                    createDto.clinical_history.ch_neoplasms,
                    createDto.clinical_history.ch_neoplasms_description,
                    createDto.clinical_history.ch_observations,
                    createDto.clinical_history.ch_rcvg as RcvgType,
                    createDto.clinical_history.ch_vision_problems,
                    createDto.clinical_history.ch_vision_hearing,
                    undefined, // createAt defaults to now
                    savedOlderAdult.id
                );

                const savedClinicalHistory = await queryRunner.manager.save(ClinicalHistory, clinicalHistory);

                // 6. Handle Clinical Conditions by ID (can be empty array)
                if (createDto.clinical_history.clinical_conditions && createDto.clinical_history.clinical_conditions.length > 0) {
                    for (const conditionRef of createDto.clinical_history.clinical_conditions) {
                        const condition = await queryRunner.manager.findOne(ClinicalCondition, {
                            where: { id: conditionRef.id }
                        });

                        if (condition) {
                            const historyCondition = new ClinicalHistoryAndCondition(
                                savedClinicalHistory.id,
                                condition.id
                            );
                            await queryRunner.manager.save(ClinicalHistoryAndCondition, historyCondition);
                        }
                    }
                }

                // 7. Handle Vaccines by ID (can be empty array)
                if (createDto.clinical_history.vaccines && createDto.clinical_history.vaccines.length > 0) {
                    for (const vaccineRef of createDto.clinical_history.vaccines) {
                        const vaccine = await queryRunner.manager.findOne(Vaccine, {
                            where: { id: vaccineRef.id }
                        });

                        if (vaccine) {
                            const historyVaccine = new VaccinesAndClinicalHistory(
                                savedClinicalHistory.id,
                                vaccine.id
                            );
                            await queryRunner.manager.save(VaccinesAndClinicalHistory, historyVaccine);
                        }
                    }
                }

                // 8. Handle Medications - Crear medicamentos directamente relacionados (can be empty array)
                if (createDto.clinical_history.medications && createDto.clinical_history.medications.length > 0) {
                    for (const medicationData of createDto.clinical_history.medications) {
                        const medication = new ClinicalMedication(
                            undefined,
                            medicationData.m_medication,
                            medicationData.m_dosage,
                            medicationData.m_treatment_type as TreatmentType,
                            savedClinicalHistory.id
                        );
                        await queryRunner.manager.save(ClinicalMedication, medication);
                    }
                }
            }

            await queryRunner.commitTransaction();

            return {
                message: 'Virtual record created successfully',
                data: savedOlderAdult
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error creating virtual record:', error);
            throw new InternalServerErrorException('Failed to create virtual record');
        } finally {
            await queryRunner.release();
        }
    }
}