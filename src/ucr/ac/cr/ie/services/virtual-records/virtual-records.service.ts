import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, BadRequestException, Inject } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { LoggerService } from '@common/services/logger.service';
import { SubProgram } from '../../domain/virtual-records/sub-program.entity';
import { Program } from '../../domain/virtual-records/program.entity';
import { OlderAdult, MaritalStatus, YearsSchooling, OlderAdultStatus, Gender, BloodType } from '../../domain/virtual-records/older-adult.entity';
import { OlderAdultFamily, KinshipType } from '../../domain/virtual-records/older-adult-family.entity';
import { ClinicalHistory, RcvgType } from '../../domain/virtual-records/clinical-history.entity';
import { ClinicalCondition } from '../../domain/virtual-records/clinical-condition.entity';
import { Vaccine } from '../../domain/virtual-records/vaccine.entity';
import { ClinicalMedication, TreatmentType } from '../../domain/virtual-records/clinical-medication.entity';
import { ClinicalHistoryAndCondition } from '../../domain/virtual-records/clinical-history-clinical-condition.entity';
import { VaccinesAndClinicalHistory } from '../../domain/virtual-records/clinical-history-vaccine.entity';
import { OlderAdultSubprogram } from '../../domain/virtual-records/older-adult-subprogram.entity';
import { OlderAdultUpdate } from '../../domain/audit';
import { CreateVirtualRecordDirectDto, UpdateVirtualRecordDirectDto, SearchVirtualRecordsDto } from '../../dto/virtual-records';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

@Injectable()
export class VirtualRecordsService {
    constructor(
        private logger: LoggerService,
        @Inject('ProgramRepository')
        private programRepository: Repository<Program>,
        
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
        
        @Inject('OLDER_ADULT_UPDATE_REPOSITORY')
        private readonly olderAdultUpdateRepository: Repository<OlderAdultUpdate>,
        
        @Inject('DataSource')
        private readonly dataSource: DataSource
    ) {}



    async createVirtualRecordDirect(createDto: CreateVirtualRecordDirectDto): Promise<{ message: string; data: OlderAdult }> {
        // Delegate to the create_virtual_file() SQL function (migration 009).
        // The function runs the whole creation in a single transaction, validates
        // identifiers / required fields, and returns the new ids.
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const ch = createDto.clinical_history;
            const medicationsJson = ch?.medications
                ? JSON.stringify(ch.medications)
                : null;

            const result = await queryRunner.query(
                `SELECT * FROM create_virtual_file(
                    $1::varchar, $2::varchar, $3::varchar, $4::varchar,
                    $5::date, $6::e_oa_marital_status, $7::text, $8::e_oa_years_schooling,
                    $9::varchar, $10::bool, $11::bool, $12::bool,
                    $13::varchar, $14::varchar, $15::varchar, $16::varchar, $17::smallint, $18::e_oa_status,
                    $19::date, $20::numeric,
                    $21::varchar, $22::varchar, $23::varchar,
                    $24::e_oa_gender, $25::e_oa_blood_type,
                    $26::int,
                    $27::varchar, $28::varchar, $29::varchar, $30::varchar,
                    $31::varchar, $32::varchar, $33::e_pf_kinship,
                    $34::bool, $35::numeric, $36::numeric, $37::numeric,
                    $38::varchar, $39::bool, $40::varchar, $41::text, $42::e_clinical_rcvg,
                    $43::bool, $44::bool,
                    $45::int[], $46::int[], $47::int[], $48::jsonb
                )`,
                [
                    createDto.oa_identification,
                    createDto.oa_name,
                    createDto.oa_f_last_name,
                    createDto.oa_s_last_name,
                    createDto.oa_birthdate ?? null,
                    createDto.oa_marital_status,
                    createDto.oa_dwelling ?? null,
                    createDto.oa_years_schooling,
                    createDto.oa_previous_work,
                    createDto.oa_is_retired,
                    createDto.oa_has_pension,
                    createDto.oa_other,
                    createDto.oa_other_description ?? null,
                    createDto.oa_province ?? null,
                    createDto.oa_canton ?? null,
                    createDto.oa_district ?? null,
                    createDto.oa_children_count,
                    createDto.oa_status,
                    createDto.oa_death_date ?? null,
                    createDto.oa_economic_income,
                    createDto.oa_phone_numner ?? null,
                    createDto.oa_email ?? null,
                    createDto.oa_profile_photo_url ?? null,
                    createDto.oa_gender,
                    createDto.oa_blood_type,
                    createDto.program?.id ?? null,
                    createDto.family?.pf_identification ?? null,
                    createDto.family?.pf_name ?? null,
                    createDto.family?.pf_f_last_name ?? null,
                    createDto.family?.pf_s_last_name ?? null,
                    createDto.family?.pf_phone_number ?? null,
                    createDto.family?.pf_email ?? null,
                    createDto.family?.pf_kinship ?? null,
                    ch?.ch_frequent_falls ?? false,
                    ch?.ch_weight ?? null,
                    ch?.ch_height ?? null,
                    ch?.ch_imc ?? null,
                    ch?.ch_blood_pressure ?? null,
                    ch?.ch_neoplasms ?? false,
                    ch?.ch_neoplasms_description ?? null,
                    ch?.ch_observations ?? null,
                    ch?.ch_rcvg ?? null,
                    ch?.ch_vision_problems ?? false,
                    ch?.ch_vision_hearing ?? false,
                    ch?.clinical_conditions?.map(c => c.id) ?? null,
                    ch?.vaccines?.map(v => v.id) ?? null,
                    createDto.program?.sub_programs?.map(s => s.id) ?? null,
                    medicationsJson,
                ],
            );

            const row = result[0] as { older_adult_id: number; status: string; message: string };

            if (row.status !== 'SUCCESS') {
                throw new InternalServerErrorException(row.message || 'Failed to create virtual record');
            }

            const savedOlderAdult = await this.olderAdultRepository.findOne({
                where: { id: row.older_adult_id },
            });
            if (!savedOlderAdult) {
                throw new InternalServerErrorException('Virtual record created but could not be loaded');
            }
            return {
                message: row.message,
                data: savedOlderAdult,
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (
                error instanceof ConflictException ||
                (error && (error as any).code === 'P0001' && (error as any).message?.includes('Ya existe'))
            ) {
                throw new ConflictException((error as any).message?.replace(/^Error:\s*/, ''));
            }
            // The create_virtual_file() SQL function validates its required
            // inputs (e.g. missing family information) via RAISE EXCEPTION,
            // which Postgres surfaces as error code P0001. These represent
            // invalid/incomplete client input, not a server failure, so they
            // should map to 400 Bad Request instead of 500.
            if (error && (error as any).code === 'P0001') {
                throw new BadRequestException((error as any).message?.replace(/^Error:\s*/, ''));
            }
            console.error('Error creating virtual record:', error);
            throw new InternalServerErrorException(
                (error as any).message?.replace(/^Error:\s*/, '') ??
                    'Failed to create virtual record',
            );
        } finally {
            await queryRunner.release();
        }
    }

    async updateVirtualRecordDirect(updateDto: UpdateVirtualRecordDirectDto, changedByUserId?: number): Promise<{ message: string; data: OlderAdult }> {
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
                oaProvince: updateDto.oa_province,
                oaCanton: updateDto.oa_canton,
                oaDistrict: updateDto.oa_district,
                oaChildrenCount: updateDto.oa_children_count,
                oaStatus: updateDto.oa_status as OlderAdultStatus,
                oaDeathDate: updateDto.oa_death_date ? new Date(updateDto.oa_death_date) : undefined,
                oaDocumentType: updateDto.oa_document_type ?? existingOlderAdult.oaDocumentType,
                oaEconomicIncome: updateDto.oa_economic_income,
                oaPhoneNumner: updateDto.oa_phone_numner,
                oaEmail: updateDto.oa_email,
                oaProfilePhotoUrl: updateDto.oa_profile_photo_url,
                oaGender: updateDto.oa_gender as Gender,
                oaBloodType: updateDto.oa_blood_type as BloodType,
                idProgram: program.id,
                idFamily: family?.id
            });

            // Log changes to older_adult_updates
            if (changedByUserId) {
                const changes: Array<{ field: string; oldVal: string | null; newVal: string | null }> = [];
                const compare = (field: string, oldVal: any, newVal: any) => {
                    const oldStr = oldVal != null ? String(oldVal) : null;
                    const newStr = newVal != null ? String(newVal) : null;
                    if (oldStr !== newStr) {
                        changes.push({ field, oldVal: oldStr, newVal: newStr });
                    }
                };
                compare('oa_identification', existingOlderAdult.oaIdentification, updateDto.oa_identification);
                compare('oa_name', existingOlderAdult.oaName, updateDto.oa_name);
                compare('oa_f_last_name', existingOlderAdult.oaFLastName, updateDto.oa_f_last_name);
                compare('oa_s_last_name', existingOlderAdult.oaSLastName, updateDto.oa_s_last_name);
                compare('oa_birthdate', existingOlderAdult.oaBirthdate instanceof Date ? existingOlderAdult.oaBirthdate.toISOString().split('T')[0] : existingOlderAdult.oaBirthdate, updateDto.oa_birthdate);
                compare('oa_marital_status', existingOlderAdult.oaMaritalStatus, updateDto.oa_marital_status);
                compare('oa_dwelling', existingOlderAdult.oaDwelling, updateDto.oa_dwelling);
                compare('oa_years_schooling', existingOlderAdult.oaYearsSchooling, updateDto.oa_years_schooling);
                compare('oa_previous_work', existingOlderAdult.oaPreviousWork, updateDto.oa_previous_work);
                compare('oa_is_retired', existingOlderAdult.oaIsRetired != null ? String(existingOlderAdult.oaIsRetired) : null, updateDto.oa_is_retired != null ? String(updateDto.oa_is_retired) : null);
                compare('oa_has_pension', existingOlderAdult.oaHasPension != null ? String(existingOlderAdult.oaHasPension) : null, updateDto.oa_has_pension != null ? String(updateDto.oa_has_pension) : null);
                compare('oa_other', existingOlderAdult.oaOther != null ? String(existingOlderAdult.oaOther) : null, updateDto.oa_other != null ? String(updateDto.oa_other) : null);
                compare('oa_other_description', existingOlderAdult.oaOtherDescription, updateDto.oa_other_description);
                compare('oa_province', existingOlderAdult.oaProvince, updateDto.oa_province);
                compare('oa_canton', existingOlderAdult.oaCanton, updateDto.oa_canton);
                compare('oa_district', existingOlderAdult.oaDistrict, updateDto.oa_district);
                compare('oa_children_count', existingOlderAdult.oaChildrenCount != null ? String(existingOlderAdult.oaChildrenCount) : null, updateDto.oa_children_count != null ? String(updateDto.oa_children_count) : null);
                compare('oa_status', existingOlderAdult.oaStatus, updateDto.oa_status);
                compare('oa_death_date', existingOlderAdult.oaDeathDate instanceof Date ? existingOlderAdult.oaDeathDate.toISOString().split('T')[0] : existingOlderAdult.oaDeathDate, updateDto.oa_death_date);
                compare('oa_economic_income', existingOlderAdult.oaEconomicIncome != null ? String(existingOlderAdult.oaEconomicIncome) : null, updateDto.oa_economic_income != null ? String(updateDto.oa_economic_income) : null);
                compare('oa_phone_number', existingOlderAdult.oaPhoneNumber, updateDto.oa_phone_numner);
                compare('oa_email', existingOlderAdult.oaEmail, updateDto.oa_email);
                compare('oa_gender', existingOlderAdult.oaGender, updateDto.oa_gender);
                compare('oa_blood_type', existingOlderAdult.oaBloodType, updateDto.oa_blood_type);

                for (const change of changes) {
                    await queryRunner.manager.save(OlderAdultUpdate, {
                        idOlderAdult: updateDto.id,
                        oauFieldChanged: change.field,
                        oauOldValue: change.oldVal,
                        oauNewValue: change.newVal,
                        changedBy: changedByUserId,
                    });
                }

                if (changes.length > 0) {
                    this.logger.debug(`Logged ${changes.length} field change(s) for older adult ${updateDto.id}`, sanitizeForLogging({ changes }));
                }
            }

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
            this.logger.error('Error updating virtual record', sanitizeForLogging({ error: String(error) }));
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to update virtual record');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Optimización N+1: Hidrata una lista de adultos mayores con sus programas,
     * subprogramas, familias e historial clínico en lotes (batch queries) con índices O(1).
     */
    private async hydrateVirtualRecords(olderAdults: OlderAdult[]): Promise<any[]> {
        if (!olderAdults || olderAdults.length === 0) {
            return [];
        }

        const adultIds = olderAdults.map(a => a.id);
        const programIds = [...new Set(olderAdults.map(a => a.idProgram).filter((id): id is number => typeof id === 'number' && id > 0))];
        const familyIds = [...new Set(olderAdults.map(a => a.idFamily).filter((id): id is number => typeof id === 'number' && id > 0))];

        // Paso 1: Cargar programas, familias, links de subprogramas e historias clínicas en paralelo
        const [
            programs,
            families,
            subprogramLinks,
            clinicalHistories
        ] = await Promise.all([
            programIds.length > 0 ? this.programRepository.find({ where: { id: In(programIds) } }) : Promise.resolve([]),
            familyIds.length > 0 ? this.familyRepository.find({ where: { id: In(familyIds) } }) : Promise.resolve([]),
            this.olderAdultSubprogramRepository.find({ where: { idOlderAdult: In(adultIds) } }),
            this.clinicalHistoryRepository.find({ where: { idOlderAdult: In(adultIds) } })
        ]);

        const programMap = new Map(programs.map(p => [p.id, p]));
        const familyMap = new Map(families.map(f => [f.id, f]));
        const chByAdultId = new Map(clinicalHistories.map(ch => [ch.idOlderAdult, ch]));

        // Indexar links de subprogramas por idOlderAdult
        const subprogramLinksByAdultId = new Map<number, OlderAdultSubprogram[]>();
        for (const link of subprogramLinks) {
            const list = subprogramLinksByAdultId.get(link.idOlderAdult) || [];
            list.push(link);
            subprogramLinksByAdultId.set(link.idOlderAdult, list);
        }

        const subprogramIds = [...new Set(subprogramLinks.map(sl => sl.idSubProgram))];
        const chIds = clinicalHistories.map(ch => ch.id);

        // Paso 2: Cargar entidades de subprogramas y detalles de historias clínicas en paralelo
        const [
            subPrograms,
            historyConditions,
            historyVaccines,
            medications
        ] = await Promise.all([
            subprogramIds.length > 0 ? this.subProgramRepository.find({ where: { id: In(subprogramIds) } }) : Promise.resolve([]),
            chIds.length > 0 ? this.historyConditionRepository.find({ where: { idCHistory: In(chIds) } }) : Promise.resolve([]),
            chIds.length > 0 ? this.historyVaccineRepository.find({ where: { idCHistory: In(chIds) } }) : Promise.resolve([]),
            chIds.length > 0 ? this.medicationRepository.find({ where: { idClinicalHistory: In(chIds) } }) : Promise.resolve([])
        ]);

        const subProgramMap = new Map(subPrograms.map(sp => [sp.id, sp]));

        // Indexar relaciones intermedias de historia clínica
        const historyConditionsByChId = new Map<number, ClinicalHistoryAndCondition[]>();
        for (const hc of historyConditions) {
            const list = historyConditionsByChId.get(hc.idCHistory) || [];
            list.push(hc);
            historyConditionsByChId.set(hc.idCHistory, list);
        }

        const historyVaccinesByChId = new Map<number, VaccinesAndClinicalHistory[]>();
        for (const hv of historyVaccines) {
            const list = historyVaccinesByChId.get(hv.idCHistory) || [];
            list.push(hv);
            historyVaccinesByChId.set(hv.idCHistory, list);
        }

        const medicationsByChId = new Map<number, ClinicalMedication[]>();
        for (const med of medications) {
            const list = medicationsByChId.get(med.idClinicalHistory) || [];
            list.push(med);
            medicationsByChId.set(med.idClinicalHistory, list);
        }

        const conditionIds = [...new Set(historyConditions.map(hc => hc.idCCondition))];
        const vaccineIds = [...new Set(historyVaccines.map(hv => hv.idVaccine))];

        // Paso 3: Cargar catálogos de condiciones y vacunas en paralelo
        const [
            conditions,
            vaccines
        ] = await Promise.all([
            conditionIds.length > 0 ? this.clinicalConditionRepository.find({ where: { id: In(conditionIds) } }) : Promise.resolve([]),
            vaccineIds.length > 0 ? this.vaccineRepository.find({ where: { id: In(vaccineIds) } }) : Promise.resolve([])
        ]);

        const conditionMap = new Map(conditions.map(c => [c.id, c]));
        const vaccineMap = new Map(vaccines.map(v => [v.id, v]));

        // Paso 4: Mapear y ensamblar cada adulto mayor en memoria
        return olderAdults.map(adult => {
            // Programa y subprogramas
            let program = null;
            if (adult.idProgram && programMap.has(adult.idProgram)) {
                const programEntity = programMap.get(adult.idProgram)!;
                const links = subprogramLinksByAdultId.get(adult.id) || [];
                const subProgramsData = links
                    .map(link => {
                        const sp = subProgramMap.get(link.idSubProgram);
                        return sp ? {
                            id: sp.id,
                            spName: sp.spName,
                            idProgram: sp.idProgram
                        } : null;
                    })
                    .filter((sp): sp is NonNullable<typeof sp> => sp !== null);

                program = {
                    id: programEntity.id,
                    pName: programEntity.pName,
                    createAt: programEntity.createAt,
                    subPrograms: subProgramsData
                };
            }

            // Familia y contactos
            let family = null;
            if (adult.idFamily && familyMap.has(adult.idFamily)) {
                const familyEntity = familyMap.get(adult.idFamily)!;
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
                    emergencyContacts: []
                };
            }

            // Historia clínica, condiciones, vacunas y medicamentos
            const clinicalHistory = chByAdultId.get(adult.id);
            let clinicalData = null;
            if (clinicalHistory) {
                const hcs = historyConditionsByChId.get(clinicalHistory.id) || [];
                const conditionsList = hcs
                    .map(hc => {
                        const cond = conditionMap.get(hc.idCCondition);
                        return cond ? {
                            id: cond.id,
                            ccName: cond.ccName
                        } : null;
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null);

                const hvs = historyVaccinesByChId.get(clinicalHistory.id) || [];
                const vaccinesList = hvs
                    .map(hv => {
                        const v = vaccineMap.get(hv.idVaccine);
                        return v ? {
                            id: v.id,
                            vName: v.vName
                        } : null;
                    })
                    .filter((v): v is NonNullable<typeof v> => v !== null);

                const meds = medicationsByChId.get(clinicalHistory.id) || [];
                const formattedMeds = meds.map(med => ({
                    id: med.id,
                    mMedication: med.mMedication,
                    mDosage: med.mDosage,
                    mTreatmentType: med.mTreatmentType,
                    mStartDate: null,
                    mObservations: null
                }));

                clinicalData = {
                    id: clinicalHistory.id,
                    chBloodType: adult.oaBloodType,
                    chAllergies: null,
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
                    conditions: conditionsList,
                    vaccines: vaccinesList,
                    medications: formattedMeds
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
                oaEntryDate: adult.createAt,
                oaStatus: adult.oaStatus,
                oaMaritalStatus: adult.oaMaritalStatus,
                oaYearsSchooling: adult.oaYearsSchooling,
                oaPreviousWork: adult.oaPreviousWork,
                oaIsRetired: adult.oaIsRetired,
                oaHasPension: adult.oaHasPension,
                oaOther: adult.oaOther,
                oaOtherDescription: adult.oaOtherDescription,
                oaProvince: adult.oaProvince,
                oaCanton: adult.oaCanton,
                oaDistrict: adult.oaDistrict,
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
        });
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
                .orWhere('CONCAT(oa.oaName, \' \', oa.oaFLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, \' \', oa.oaFLastName, \' \', oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaFLastName, \' \', oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orderBy('oa.id', 'ASC');

            const olderAdults = await queryBuilder.getMany();

            // Transform the results to include all related data in batches (no N+1)
            const transformedData = await this.hydrateVirtualRecords(olderAdults);

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

            // Transform the results to include all related data in batches (no N+1)
            const transformedData = await this.hydrateVirtualRecords(olderAdults);

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
        // Delegate to the delete_virtual_file() SQL function (migration 009).
        // The function deletes the older adult (and its clinical history, M:N
        // relations and the family if the family is not referenced by any
        // other older adult) in a single transaction and uses id_older_adult
        // for safety so we can never touch another patient's data.
        const existing = await this.olderAdultRepository.findOne({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Older adult with ID ${id} not found`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const result = await queryRunner.query(
                `SELECT * FROM delete_virtual_file($1::varchar)`,
                [existing.oaIdentification],
            );
            const row = (result[0] as { status?: string; message?: string }) || {};
            if (row.status && row.status !== 'SUCCESS') {
                throw new InternalServerErrorException(row.message || 'Failed to delete virtual record');
            }
            return { message: row.message || 'Virtual record deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            if (
                error &&
                (error as any).code === 'P0001' &&
                typeof (error as any).message === 'string' &&
                (error as any).message.includes('No existe')
            ) {
                throw new NotFoundException(
                    (error as any).message.replace(/^Error:\s*/, ''),
                );
            }
            console.error('Error deleting virtual record:', error);
            throw new InternalServerErrorException(
                (error as any).message?.replace(/^Error:\s*/, '') ??
                    'Failed to delete virtual record',
            );
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

            // Transform the result to include all related data via batch hydration
            const [transformedData] = await this.hydrateVirtualRecords([olderAdult]);

            return {
                message: 'Virtual record found successfully',
                data: transformedData
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Error retrieving virtual record:', error);
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
                .orWhere('CONCAT(oa.oaName, \' \', oa.oaFLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaName, \' \', oa.oaFLastName, \' \', oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
                .orWhere('CONCAT(oa.oaFLastName, \' \', oa.oaSLastName) LIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
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