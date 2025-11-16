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
import { CreateVirtualRecordDirectDto, UpdateVirtualRecordDirectDto, SearchVirtualRecordsDto } from '../../dto/virtual-records';

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

    async updateVirtualRecordDirect(updateDto: UpdateVirtualRecordDirectDto): Promise<{ message: string; data: OlderAdult }> {
        // Check if older adult exists
        const existingOlderAdult = await this.olderAdultRepository.findOne({
            where: { id: updateDto.id }
        });

        if (!existingOlderAdult) {
            throw new NotFoundException(`Older adult with ID ${updateDto.id} not found`);
        }

        // Check if the new identification conflicts with another record
        if (updateDto.oa_identification !== existingOlderAdult.oaIdentification) {
            const conflictingRecord = await this.olderAdultRepository.findOne({
                where: { oaIdentification: updateDto.oa_identification }
            });

            if (conflictingRecord && conflictingRecord.id !== updateDto.id) {
                throw new ConflictException('Another older adult with this identification already exists');
            }
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Handle Program - first try to find existing program
            let program: Program;
            if (updateDto.program?.id) {
                program = await queryRunner.manager.findOne(Program, {
                    where: { id: updateDto.program.id }
                });
                if (!program) {
                    throw new NotFoundException(`Program with ID ${updateDto.program.id} not found`);
                }
            } else {
                // Create a default program if none specified
                program = new Program(undefined, 'General Program');
                program = await queryRunner.manager.save(Program, program);
            }

            // 2. Handle Family (optional) - delete existing and create new if provided
            if (existingOlderAdult.idFamily) {
                // Delete existing family relationship
                await queryRunner.manager.delete(OlderAdultFamily, { id: existingOlderAdult.idFamily });
            }

            let family: OlderAdultFamily | undefined;
            if (updateDto.family && updateDto.family.pf_identification) {
                // Check if family member already exists with this identification
                family = await queryRunner.manager.findOne(OlderAdultFamily, {
                    where: { pfIdentification: updateDto.family.pf_identification }
                });

                if (!family) {
                    family = new OlderAdultFamily(
                        undefined,
                        updateDto.family.pf_identification,
                        updateDto.family.pf_name,
                        updateDto.family.pf_f_last_name,
                        updateDto.family.pf_s_last_name,
                        updateDto.family.pf_phone_number,
                        updateDto.family.pf_email,
                        updateDto.family.pf_kinship as KinshipType
                    );
                    family = await queryRunner.manager.save(OlderAdultFamily, family);
                }
            }

            // 3. Update Older Adult
            const updatedOlderAdult = await queryRunner.manager.save(OlderAdult, {
                ...existingOlderAdult,
                oaIdentification: updateDto.oa_identification,
                oaName: updateDto.oa_name,
                oaFLastName: updateDto.oa_f_last_name,
                oaSLastName: updateDto.oa_s_last_name,
                oaBirthdate: updateDto.oa_birthdate ? new Date(updateDto.oa_birthdate) : undefined,
                oaMaritalStatus: updateDto.oa_marital_status as MaritalStatus,
                oaDwelling: updateDto.oa_dwelling,
                oaYearsSchooling: updateDto.oa_years_schooling as YearsSchooling,
                oaPreviousWork: updateDto.oa_previous_work,
                oaIsRetired: updateDto.oa_is_retired,
                oaHasPension: updateDto.oa_has_pension,
                oaOther: updateDto.oa_other,
                oaOtherDescription: updateDto.oa_other_description,
                oaAreaOfOrigin: updateDto.oa_area_of_origin,
                oaChildrenCount: updateDto.oa_children_count,
                oaStatus: updateDto.oa_status as OlderAdultStatus,
                oaDeathDate: updateDto.oa_death_date ? new Date(updateDto.oa_death_date) : undefined,
                oaEconomicIncome: updateDto.oa_economic_income,
                oaPhoneNumner: updateDto.oa_phone_numner,
                oaEmail: updateDto.oa_email,
                oaProfilePhotoUrl: updateDto.oa_profile_photo_url,
                oaGender: updateDto.oa_gender as Gender,
                oaBloodType: updateDto.oa_blood_type as BloodType,
                idProgram: program.id,
                idFamily: family?.id
            });

            // 4. Handle Sub-programs - Delete existing and create new ones
            await queryRunner.manager.delete(OlderAdultSubprogram, { idOlderAdult: updateDto.id });
            
            if (updateDto.program?.sub_programs?.length > 0) {
                for (const subProgramRef of updateDto.program.sub_programs) {
                    const subProgram = await queryRunner.manager.findOne(SubProgram, {
                        where: { id: subProgramRef.id }
                    });

                    if (subProgram) {
                        const olderAdultSubprogram = new OlderAdultSubprogram(
                            updatedOlderAdult.id,
                            subProgram.id
                        );
                        await queryRunner.manager.save(OlderAdultSubprogram, olderAdultSubprogram);
                    }
                }
            }

            // 5. Handle Clinical History - Delete existing and create new if provided
            // First, find existing clinical history
            const existingClinicalHistory = await queryRunner.manager.findOne(ClinicalHistory, {
                where: { idOlderAdult: updateDto.id }
            });

            if (existingClinicalHistory) {
                // Delete all related records
                await queryRunner.manager.delete(ClinicalMedication, { idClinicalHistory: existingClinicalHistory.id });
                await queryRunner.manager.delete(ClinicalHistoryAndCondition, { idCHistory: existingClinicalHistory.id });
                await queryRunner.manager.delete(VaccinesAndClinicalHistory, { idCHistory: existingClinicalHistory.id });
                await queryRunner.manager.delete(ClinicalHistory, { id: existingClinicalHistory.id });
            }

            if (updateDto.clinical_history) {
                const clinicalHistory = new ClinicalHistory(
                    undefined,
                    updateDto.clinical_history.ch_frequent_falls,
                    updateDto.clinical_history.ch_weight,
                    updateDto.clinical_history.ch_height,
                    updateDto.clinical_history.ch_imc,
                    updateDto.clinical_history.ch_blood_pressure,
                    updateDto.clinical_history.ch_neoplasms,
                    updateDto.clinical_history.ch_neoplasms_description,
                    updateDto.clinical_history.ch_observations,
                    updateDto.clinical_history.ch_rcvg as RcvgType,
                    updateDto.clinical_history.ch_vision_problems,
                    updateDto.clinical_history.ch_vision_hearing,
                    undefined, // createAt defaults to now
                    updatedOlderAdult.id
                );

                const savedClinicalHistory = await queryRunner.manager.save(ClinicalHistory, clinicalHistory);

                // 6. Handle Clinical Conditions by ID (can be empty array)
                if (updateDto.clinical_history.clinical_conditions && updateDto.clinical_history.clinical_conditions.length > 0) {
                    for (const conditionRef of updateDto.clinical_history.clinical_conditions) {
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
                if (updateDto.clinical_history.vaccines && updateDto.clinical_history.vaccines.length > 0) {
                    for (const vaccineRef of updateDto.clinical_history.vaccines) {
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

                // 8. Handle Medications - Create medications directly related (can be empty array)
                if (updateDto.clinical_history.medications && updateDto.clinical_history.medications.length > 0) {
                    for (const medicationData of updateDto.clinical_history.medications) {
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
                message: 'Virtual record updated successfully',
                data: updatedOlderAdult
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error updating virtual record:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to update virtual record');
        } finally {
            await queryRunner.release();
        }
    }

    async searchVirtualRecords(searchDto: SearchVirtualRecordsDto): Promise<{ message: string; data: any[] }> {
        try {
            const searchTerm = searchDto.search;

            // Create query builder for universal search
            const queryBuilder = this.olderAdultRepository.createQueryBuilder('oa')
                .where('oa.oaIdentification LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaFLastName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaSLastName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, " ", oa.oaFLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, " ", oa.oaFLastName, " ", oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaFLastName, " ", oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orderBy('oa.id', 'ASC');

            const olderAdults = await queryBuilder.getMany();

            // Transform the results to include all related data
            const transformedData = await Promise.all(
                olderAdults.map(async (adult) => {
                    // Get program information
                    let program = null;
                    if (adult.idProgram) {
                        const programEntity = await this.programRepository.findOne({
                            where: { id: adult.idProgram }
                        });

                        if (programEntity) {
                            // Get sub-programs for this older adult
                            const subPrograms = await this.olderAdultSubprogramRepository.find({
                                where: { idOlderAdult: adult.id }
                            });

                            const subProgramsData = await Promise.all(
                                subPrograms.map(async (oasp) => {
                                    const subProgram = await this.subProgramRepository.findOne({
                                        where: { id: oasp.idSubProgram }
                                    });
                                    return subProgram ? {
                                        id: subProgram.id,
                                        spName: subProgram.spName,
                                        idProgram: subProgram.idProgram
                                    } : null;
                                })
                            );

                            program = {
                                id: programEntity.id,
                                pName: programEntity.pName,
                                createAt: programEntity.createAt,
                                subPrograms: subProgramsData.filter(sp => sp !== null)
                            };
                        }
                    }

                    // Get family information
                    let family = null;
                    if (adult.idFamily) {
                        const familyEntity = await this.familyRepository.findOne({
                            where: { id: adult.idFamily }
                        });

                        if (familyEntity) {
                            family = {
                                id: familyEntity.id,
                                pfIdentification: familyEntity.pfIdentification,
                                pfName: familyEntity.pfName,
                                pfFLastName: familyEntity.pfFLastName,
                                pfSLastName: familyEntity.pfSLastName,
                                pfPhoneNumber: familyEntity.pfPhoneNumber,
                                pfEmail: familyEntity.pfEmail,
                                pfKinship: familyEntity.pfKinship,
                                createAt: familyEntity.createAt
                            };
                        }
                    }

                    // Get clinical history with conditions, vaccines, and medications
                    const clinicalHistory = await this.clinicalHistoryRepository.findOne({
                        where: { idOlderAdult: adult.id }
                    });

                    let clinicalData = null;
                    if (clinicalHistory) {
                        // Get conditions
                        const historyConditions = await this.historyConditionRepository.find({
                            where: { idCHistory: clinicalHistory.id }
                        });

                        const conditions = await Promise.all(
                            historyConditions.map(async (hc) => {
                                const condition = await this.clinicalConditionRepository.findOne({
                                    where: { id: hc.idCCondition }
                                });
                                return condition ? {
                                    id: condition.id,
                                    ccName: condition.ccName
                                } : null;
                            })
                        );

                        // Get vaccines
                        const historyVaccines = await this.historyVaccineRepository.find({
                            where: { idCHistory: clinicalHistory.id }
                        });

                        const vaccines = await Promise.all(
                            historyVaccines.map(async (hv) => {
                                const vaccine = await this.vaccineRepository.findOne({
                                    where: { id: hv.idVaccine }
                                });
                                return vaccine ? {
                                    id: vaccine.id,
                                    vName: vaccine.vName
                                } : null;
                            })
                        );

                        // Get medications
                        const medications = await this.medicationRepository.find({
                            where: { idClinicalHistory: clinicalHistory.id }
                        });

                        clinicalData = {
                            id: clinicalHistory.id,
                            chFrequentFalls: clinicalHistory.chFrequentFalls,
                            chWeight: clinicalHistory.chWeight,
                            chHeight: clinicalHistory.chHeight,
                            chImc: clinicalHistory.chImc,
                            chBloodPressure: clinicalHistory.chBloodPressure,
                            chNeoplasms: clinicalHistory.chNeoplasms,
                            chNeoplasmsDescription: clinicalHistory.chNeoplasmsDescription,
                            chObservations: clinicalHistory.chObservations,
                            chRcvg: clinicalHistory.chRcvg,
                            chVisionProblems: clinicalHistory.chVisionProblems,
                            chVisionHearing: clinicalHistory.chVisionHearing,
                            createAt: clinicalHistory.createAt,
                            conditions: conditions.filter(c => c !== null),
                            vaccines: vaccines.filter(v => v !== null),
                            medications: medications.map(med => ({
                                id: med.id,
                                mMedication: med.mMedication,
                                mDosage: med.mDosage,
                                mTreatmentType: med.mTreatmentType
                            }))
                        };
                    }

                    return {
                        id: adult.id,
                        oaIdentification: adult.oaIdentification,
                        oaName: adult.oaName,
                        oaFLastName: adult.oaFLastName,
                        oaSLastName: adult.oaSLastName,
                        oaBirthdate: adult.oaBirthdate,
                        oaMaritalStatus: adult.oaMaritalStatus,
                        oaDwelling: adult.oaDwelling,
                        oaYearsSchooling: adult.oaYearsSchooling,
                        oaPreviousWork: adult.oaPreviousWork,
                        oaIsRetired: adult.oaIsRetired,
                        oaHasPension: adult.oaHasPension,
                        oaOther: adult.oaOther,
                        oaOtherDescription: adult.oaOtherDescription,
                        oaAreaOfOrigin: adult.oaAreaOfOrigin,
                        oaChildrenCount: adult.oaChildrenCount,
                        oaStatus: adult.oaStatus,
                        oaDeathDate: adult.oaDeathDate,
                        oaEconomicIncome: adult.oaEconomicIncome,
                        oaPhoneNumber: adult.oaPhoneNumber,
                        oaEmail: adult.oaEmail,
                        oaProfilePhotoUrl: adult.oaProfilePhotoUrl,
                        oaGender: adult.oaGender,
                        oaBloodType: adult.oaBloodType,
                        createAt: adult.createAt,
                        program,
                        family,
                        clinicalHistory: clinicalData
                    };
                })
            );

            return {
                message: `Found ${transformedData.length} virtual record(s) matching "${searchTerm}"`,
                data: transformedData
            };

        } catch (error) {
            console.error('Error searching virtual records:', error);
            throw new InternalServerErrorException('Failed to search virtual records');
        }
    }

    async getAllVirtualRecords(): Promise<{ message: string; data: any[] }> {
        try {
            // Get all older adults ordered by ID
            const olderAdults = await this.olderAdultRepository.find({
                order: { id: 'ASC' }
            });

            // Transform the results to include all related data (same logic as searchVirtualRecords)
            const transformedData = await Promise.all(
                olderAdults.map(async (adult) => {
                    // Get program information
                    let program = null;
                    if (adult.idProgram) {
                        const programEntity = await this.programRepository.findOne({
                            where: { id: adult.idProgram }
                        });

                        if (programEntity) {
                            // Get sub-programs for this older adult
                            const subPrograms = await this.olderAdultSubprogramRepository.find({
                                where: { idOlderAdult: adult.id }
                            });

                            const subProgramsData = await Promise.all(
                                subPrograms.map(async (oasp) => {
                                    const subProgram = await this.subProgramRepository.findOne({
                                        where: { id: oasp.idSubProgram }
                                    });
                                    return subProgram ? {
                                        id: subProgram.id,
                                        spName: subProgram.spName,
                                        idProgram: subProgram.idProgram
                                    } : null;
                                })
                            );

                            program = {
                                id: programEntity.id,
                                pName: programEntity.pName,
                                createAt: programEntity.createAt,
                                subPrograms: subProgramsData.filter(sp => sp !== null)
                            };
                        }
                    }

                    // Get family information with emergency contacts
                    let family = null;
                    if (adult.idFamily) {
                        const familyEntity = await this.familyRepository.findOne({
                            where: { id: adult.idFamily }
                        });

                        if (familyEntity) {
                            // Note: Emergency contacts would need a separate entity/repository
                            // For now, we'll return the family info without emergency contacts
                            family = {
                                id: familyEntity.id,
                                pfIdentification: familyEntity.pfIdentification,
                                pfName: familyEntity.pfName,
                                pfFLastName: familyEntity.pfFLastName,
                                pfSLastName: familyEntity.pfSLastName,
                                pfPhoneNumber: familyEntity.pfPhoneNumber,
                                pfEmail: familyEntity.pfEmail,
                                pfKinship: familyEntity.pfKinship,
                                createAt: familyEntity.createAt,
                                emergencyContacts: [] // TODO: Implement emergency contacts entity
                            };
                        }
                    }

                    // Get clinical history with conditions, vaccines, and medications
                    const clinicalHistory = await this.clinicalHistoryRepository.findOne({
                        where: { idOlderAdult: adult.id }
                    });

                    let clinicalData = null;
                    if (clinicalHistory) {
                        // Get conditions
                        const historyConditions = await this.historyConditionRepository.find({
                            where: { idCHistory: clinicalHistory.id }
                        });

                        const conditions = await Promise.all(
                            historyConditions.map(async (hc) => {
                                const condition = await this.clinicalConditionRepository.findOne({
                                    where: { id: hc.idCCondition }
                                });
                                return condition ? {
                                    id: condition.id,
                                    ccName: condition.ccName
                                } : null;
                            })
                        );

                        // Get vaccines
                        const historyVaccines = await this.historyVaccineRepository.find({
                            where: { idCHistory: clinicalHistory.id }
                        });

                        const vaccines = await Promise.all(
                            historyVaccines.map(async (hv) => {
                                const vaccine = await this.vaccineRepository.findOne({
                                    where: { id: hv.idVaccine }
                                });
                                return vaccine ? {
                                    id: vaccine.id,
                                    vName: vaccine.vName
                                } : null;
                            })
                        );

                        // Get medications
                        const medications = await this.medicationRepository.find({
                            where: { idClinicalHistory: clinicalHistory.id }
                        });

                        clinicalData = {
                            id: clinicalHistory.id,
                            chBloodType: adult.oaBloodType, // Include blood type from older adult
                            chAllergies: null, // TODO: Add allergies field to entity if needed
                            chEmergencyObservations: clinicalHistory.chObservations,
                            chFrequentFalls: clinicalHistory.chFrequentFalls,
                            chWeight: clinicalHistory.chWeight,
                            chHeight: clinicalHistory.chHeight,
                            chImc: clinicalHistory.chImc,
                            chBloodPressure: clinicalHistory.chBloodPressure,
                            chNeoplasms: clinicalHistory.chNeoplasms,
                            chNeoplasmsDescription: clinicalHistory.chNeoplasmsDescription,
                            chObservations: clinicalHistory.chObservations,
                            chRcvg: clinicalHistory.chRcvg,
                            chVisionProblems: clinicalHistory.chVisionProblems,
                            chVisionHearing: clinicalHistory.chVisionHearing,
                            createAt: clinicalHistory.createAt,
                            conditions: conditions.filter(c => c !== null),
                            vaccines: vaccines.filter(v => v !== null),
                            medications: medications.map(med => ({
                                id: med.id,
                                mMedication: med.mMedication,
                                mDosage: med.mDosage,
                                mTreatmentType: med.mTreatmentType,
                                mStartDate: null, // TODO: Add start date field to medication entity if needed
                                mObservations: null // TODO: Add observations field to medication entity if needed
                            }))
                        };
                    }

                    return {
                        id: adult.id,
                        oaIdentification: adult.oaIdentification,
                        oaName: adult.oaName,
                        oaFLastName: adult.oaFLastName,
                        oaSLastName: adult.oaSLastName,
                        oaBirthdate: adult.oaBirthdate,
                        oaGender: adult.oaGender,
                        oaPhoneNumber: adult.oaPhoneNumber,
                        oaEmail: adult.oaEmail,
                        oaAddress: adult.oaDwelling,
                        oaEntryDate: adult.createAt, // Using createAt as entry date
                        oaStatus: adult.oaStatus,
                        oaMaritalStatus: adult.oaMaritalStatus,
                        oaYearsSchooling: adult.oaYearsSchooling,
                        oaPreviousWork: adult.oaPreviousWork,
                        oaIsRetired: adult.oaIsRetired,
                        oaHasPension: adult.oaHasPension,
                        oaOther: adult.oaOther,
                        oaOtherDescription: adult.oaOtherDescription,
                        oaAreaOfOrigin: adult.oaAreaOfOrigin,
                        oaChildrenCount: adult.oaChildrenCount,
                        oaDeathDate: adult.oaDeathDate,
                        oaEconomicIncome: adult.oaEconomicIncome,
                        oaProfilePhotoUrl: adult.oaProfilePhotoUrl,
                        oaBloodType: adult.oaBloodType,
                        createAt: adult.createAt,
                        program,
                        family,
                        clinicalHistory: clinicalData
                    };
                })
            );

            return {
                message: `Found ${transformedData.length} virtual record(s)`,
                data: transformedData
            };

        } catch (error) {
            console.error('Error retrieving all virtual records:', error);
            throw new InternalServerErrorException('Failed to retrieve virtual records');
        }
    }

    async deleteVirtualRecord(id: number): Promise<{ message: string }> {
        // Check if older adult exists
        const existingOlderAdult = await this.olderAdultRepository.findOne({
            where: { id: id }
        });

        if (!existingOlderAdult) {
            throw new NotFoundException(`Older adult with ID ${id} not found`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Find and delete clinical history related data first
            const clinicalHistory = await queryRunner.manager.findOne(ClinicalHistory, {
                where: { idOlderAdult: id }
            });

            if (clinicalHistory) {
                // Delete medications related to this clinical history
                await queryRunner.manager.delete(ClinicalMedication, { 
                    idClinicalHistory: clinicalHistory.id 
                });

                // Delete clinical conditions associations
                await queryRunner.manager.delete(ClinicalHistoryAndCondition, { 
                    idCHistory: clinicalHistory.id 
                });

                // Delete vaccines associations
                await queryRunner.manager.delete(VaccinesAndClinicalHistory, { 
                    idCHistory: clinicalHistory.id 
                });

                // Delete the clinical history itself
                await queryRunner.manager.delete(ClinicalHistory, { 
                    id: clinicalHistory.id 
                });
            }

            // 2. Delete sub-program associations for this older adult
            await queryRunner.manager.delete(OlderAdultSubprogram, { 
                idOlderAdult: id 
            });

            // 3. Handle family deletion - only delete if this is the only older adult using this family
            if (existingOlderAdult.idFamily) {
                // Check if any other older adult is using the same family
                const otherAdultsWithSameFamily = await queryRunner.manager.find(OlderAdult, {
                    where: { idFamily: existingOlderAdult.idFamily }
                });

                // If this is the only older adult using this family, delete the family
                if (otherAdultsWithSameFamily.length === 1 && otherAdultsWithSameFamily[0].id === id) {
                    await queryRunner.manager.delete(OlderAdultFamily, { 
                        id: existingOlderAdult.idFamily 
                    });
                }
            }

            // 4. Finally, delete the older adult record itself
            await queryRunner.manager.delete(OlderAdult, { id: id });

            await queryRunner.commitTransaction();

            return {
                message: 'Virtual record deleted successfully'
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error deleting virtual record:', error);
            
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to delete virtual record');
        } finally {
            await queryRunner.release();
        }
    }

    async getVirtualRecordById(id: number): Promise<{ message: string; data: any }> {
        try {
            // Find the older adult by ID
            const olderAdult = await this.olderAdultRepository.findOne({
                where: { id: id }
            });

            if (!olderAdult) {
                throw new NotFoundException(`Virtual record with ID ${id} not found`);
            }

            // Transform the result to include all related data (same logic as getAllVirtualRecords)
            // Get program information
            let program = null;
            if (olderAdult.idProgram) {
                const programEntity = await this.programRepository.findOne({
                    where: { id: olderAdult.idProgram }
                });

                if (programEntity) {
                    // Get sub-programs for this older adult
                    const subPrograms = await this.olderAdultSubprogramRepository.find({
                        where: { idOlderAdult: olderAdult.id }
                    });

                    const subProgramsData = await Promise.all(
                        subPrograms.map(async (oasp) => {
                            const subProgram = await this.subProgramRepository.findOne({
                                where: { id: oasp.idSubProgram }
                            });
                            return subProgram ? {
                                id: subProgram.id,
                                spName: subProgram.spName,
                                idProgram: subProgram.idProgram
                            } : null;
                        })
                    );

                    program = {
                        id: programEntity.id,
                        pName: programEntity.pName,
                        createAt: programEntity.createAt,
                        subPrograms: subProgramsData.filter(sp => sp !== null)
                    };
                }
            }

            // Get family information with emergency contacts
            let family = null;
            if (olderAdult.idFamily) {
                const familyEntity = await this.familyRepository.findOne({
                    where: { id: olderAdult.idFamily }
                });

                if (familyEntity) {
                    // Note: Emergency contacts would need a separate entity/repository
                    // For now, we'll return the family info without emergency contacts
                    family = {
                        id: familyEntity.id,
                        pfIdentification: familyEntity.pfIdentification,
                        pfName: familyEntity.pfName,
                        pfFLastName: familyEntity.pfFLastName,
                        pfSLastName: familyEntity.pfSLastName,
                        pfPhoneNumber: familyEntity.pfPhoneNumber,
                        pfEmail: familyEntity.pfEmail,
                        pfKinship: familyEntity.pfKinship,
                        createAt: familyEntity.createAt,
                        emergencyContacts: [] // TODO: Implement emergency contacts entity
                    };
                }
            }

            // Get clinical history with conditions, vaccines, and medications
            const clinicalHistory = await this.clinicalHistoryRepository.findOne({
                where: { idOlderAdult: olderAdult.id }
            });

            let clinicalData = null;
            if (clinicalHistory) {
                // Get conditions
                const historyConditions = await this.historyConditionRepository.find({
                    where: { idCHistory: clinicalHistory.id }
                });

                const conditions = await Promise.all(
                    historyConditions.map(async (hc) => {
                        const condition = await this.clinicalConditionRepository.findOne({
                            where: { id: hc.idCCondition }
                        });
                        return condition ? {
                            id: condition.id,
                            ccName: condition.ccName
                        } : null;
                    })
                );

                // Get vaccines
                const historyVaccines = await this.historyVaccineRepository.find({
                    where: { idCHistory: clinicalHistory.id }
                });

                const vaccines = await Promise.all(
                    historyVaccines.map(async (hv) => {
                        const vaccine = await this.vaccineRepository.findOne({
                            where: { id: hv.idVaccine }
                        });
                        return vaccine ? {
                            id: vaccine.id,
                            vName: vaccine.vName
                        } : null;
                    })
                );

                // Get medications
                const medications = await this.medicationRepository.find({
                    where: { idClinicalHistory: clinicalHistory.id }
                });

                clinicalData = {
                    id: clinicalHistory.id,
                    chBloodType: olderAdult.oaBloodType, // Include blood type from older adult
                    chAllergies: null, // TODO: Add allergies field to entity if needed
                    chEmergencyObservations: clinicalHistory.chObservations,
                    chFrequentFalls: clinicalHistory.chFrequentFalls,
                    chWeight: clinicalHistory.chWeight,
                    chHeight: clinicalHistory.chHeight,
                    chImc: clinicalHistory.chImc,
                    chBloodPressure: clinicalHistory.chBloodPressure,
                    chNeoplasms: clinicalHistory.chNeoplasms,
                    chNeoplasmsDescription: clinicalHistory.chNeoplasmsDescription,
                    chObservations: clinicalHistory.chObservations,
                    chRcvg: clinicalHistory.chRcvg,
                    chVisionProblems: clinicalHistory.chVisionProblems,
                    chVisionHearing: clinicalHistory.chVisionHearing,
                    createAt: clinicalHistory.createAt,
                    conditions: conditions.filter(c => c !== null),
                    vaccines: vaccines.filter(v => v !== null),
                    medications: medications.map(med => ({
                        id: med.id,
                        mMedication: med.mMedication,
                        mDosage: med.mDosage,
                        mTreatmentType: med.mTreatmentType,
                        mStartDate: null, // TODO: Add start date field to medication entity if needed
                        mObservations: null // TODO: Add observations field to medication entity if needed
                    }))
                };
            }

            const transformedData = {
                id: olderAdult.id,
                oaIdentification: olderAdult.oaIdentification,
                oaName: olderAdult.oaName,
                oaFLastName: olderAdult.oaFLastName,
                oaSLastName: olderAdult.oaSLastName,
                oaBirthdate: olderAdult.oaBirthdate,
                oaGender: olderAdult.oaGender,
                oaPhoneNumber: olderAdult.oaPhoneNumber,
                oaEmail: olderAdult.oaEmail,
                oaAddress: olderAdult.oaDwelling,
                oaEntryDate: olderAdult.createAt, // Using createAt as entry date
                oaStatus: olderAdult.oaStatus,
                oaMaritalStatus: olderAdult.oaMaritalStatus,
                oaYearsSchooling: olderAdult.oaYearsSchooling,
                oaPreviousWork: olderAdult.oaPreviousWork,
                oaIsRetired: olderAdult.oaIsRetired,
                oaHasPension: olderAdult.oaHasPension,
                oaOther: olderAdult.oaOther,
                oaOtherDescription: olderAdult.oaOtherDescription,
                oaAreaOfOrigin: olderAdult.oaAreaOfOrigin,
                oaChildrenCount: olderAdult.oaChildrenCount,
                oaDeathDate: olderAdult.oaDeathDate,
                oaEconomicIncome: olderAdult.oaEconomicIncome,
                oaProfilePhotoUrl: olderAdult.oaProfilePhotoUrl,
                oaBloodType: olderAdult.oaBloodType,
                createAt: olderAdult.createAt,
                program,
                family,
                clinicalHistory: clinicalData
            };

            return {
                message: 'Virtual record found successfully',
                data: transformedData
            };

        } catch (error) {
            console.error('Error retrieving virtual record:', error);
            
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to retrieve virtual record');
        }
    }

    async searchPatientsBasic(searchDto: SearchVirtualRecordsDto): Promise<{ message: string; data: any[] }> {
        try {
            const searchTerm = searchDto.search;

            // Create query builder for universal search - only basic patient info
            const queryBuilder = this.olderAdultRepository.createQueryBuilder('oa')
                .select([
                    'oa.id',
                    'oa.oaIdentification',
                    'oa.oaName',
                    'oa.oaFLastName',
                    'oa.oaSLastName',
                    'oa.oaBirthdate',
                    'oa.oaGender',
                    'oa.oaPhoneNumber',
                    'oa.oaEmail',
                    'oa.oaStatus'
                ])
                .where('oa.oaIdentification LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaFLastName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('oa.oaSLastName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, " ", oa.oaFLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, " ", oa.oaFLastName, " ", oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaFLastName, " ", oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orderBy('oa.oaName', 'ASC')
                .addOrderBy('oa.oaFLastName', 'ASC');

            const patients = await queryBuilder.getMany();

            // Transform to simplified response
            const data = patients.map(patient => ({
                id: patient.id,
                identification: patient.oaIdentification,
                name: patient.oaName,
                firstLastName: patient.oaFLastName,
                secondLastName: patient.oaSLastName,
                fullName: `${patient.oaName} ${patient.oaFLastName} ${patient.oaSLastName || ''}`.trim(),
                birthdate: patient.oaBirthdate,
                gender: patient.oaGender,
                phone: patient.oaPhoneNumber,
                email: patient.oaEmail,
                status: patient.oaStatus
            }));

            return {
                message: `Found ${patients.length} patient(s) matching "${searchTerm}"`,
                data
            };

        } catch (error) {
            console.error('Error searching patients:', error);
            throw new InternalServerErrorException('Failed to search patients');
        }
    }
}