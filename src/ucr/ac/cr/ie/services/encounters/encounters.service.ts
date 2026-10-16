import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { ClinicalEncounter, ClinicalNoteAddendum } from '../../domain/encounters';
import { getTenantContext } from '../../common/tenant/tenant-context';
import {
    CreateEncounterDto,
    UpdateEncounterSoapDto,
    CreateNoteAddendumDto
} from '../../dto/encounters';

@Injectable()
export class EncountersService {
    constructor(
        @Inject('ClinicalEncounterRepository')
        private readonly encounterRepository: Repository<ClinicalEncounter>,
        @Inject('ClinicalNoteAddendumRepository')
        private readonly addendumRepository: Repository<ClinicalNoteAddendum>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
    ) {}

    async createEncounter(dto: CreateEncounterDto): Promise<ClinicalEncounter> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.idOlderAdult }
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.idOlderAdult} no encontrado`);
        }

        const encounter = this.encounterRepository.create({
            idOlderAdult: dto.idOlderAdult,
            idProfessional: dto.idProfessional,
            encounterClass: dto.encounterClass ?? 'inpatient',
            encounterType: dto.encounterType,
            status: 'scheduled',
            startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
            chiefComplaint: dto.chiefComplaint,
            idAppointment: dto.idAppointment,
            isSigned: false
        });

        return this.encounterRepository.save(encounter);
    }

    async findById(id: number): Promise<ClinicalEncounter> {
        const encounter = await this.encounterRepository.findOne({
            where: { id },
            relations: ['olderAdult', 'professional', 'vitalSigns', 'addendums']
        });
        if (!encounter) {
            throw new NotFoundException(`Encuentro clínico con ID ${id} no encontrado`);
        }
        return encounter;
    }

    async findByPatient(patientId: number): Promise<ClinicalEncounter[]> {
        return this.encounterRepository.find({
            where: { idOlderAdult: patientId },
            relations: ['professional', 'addendums'],
            order: { startTime: 'DESC' }
        });
    }

    async updateSoap(id: number, dto: UpdateEncounterSoapDto): Promise<ClinicalEncounter> {
        return this.encounterRepository.manager.transaction(async (manager) => {
            const repository = manager.getRepository(ClinicalEncounter);
            const encounter = await repository.findOne({
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!encounter) throw new NotFoundException(`Encuentro clínico con ID ${id} no encontrado`);
            if (encounter.isSigned || encounter.status === 'signed') {
                throw new BadRequestException(
                    'La nota clínica ya ha sido firmada y es inmutable. Para corregir o añadir observaciones utilice un addendum (enmienda).'
                );
            }

            if (dto.status) {
                if (dto.status === 'signed') {
                    throw new BadRequestException('Use el endpoint de firma para cerrar el encuentro');
                }
                encounter.status = dto.status;
            }
            if (dto.endTime) encounter.endTime = new Date(dto.endTime);
            if (dto.soSubjective !== undefined) encounter.soSubjective = dto.soSubjective;
            if (dto.soObjective !== undefined) encounter.soObjective = dto.soObjective;
            if (dto.soAssessment !== undefined) encounter.soAssessment = dto.soAssessment;
            if (dto.soPlan !== undefined) encounter.soPlan = dto.soPlan;

            return repository.save(encounter);
        });
    }

    async signEncounter(id: number, signedBy: number): Promise<ClinicalEncounter> {
        const context = getTenantContext();
        if (!context) throw new BadRequestException('No se encontró el contexto de organización de la firma');

        return this.encounterRepository.manager.transaction(async (manager) => {
            const repository = manager.getRepository(ClinicalEncounter);
            const encounter = await repository.findOne({
                where: { id },
                lock: { mode: 'pessimistic_write' },
            });
            if (!encounter) throw new NotFoundException(`Encuentro clínico con ID ${id} no encontrado`);
            if (encounter.isSigned || encounter.status === 'signed') {
                throw new BadRequestException('El encuentro ya se encuentra debidamente firmado');
            }

            const signedAt = new Date();
            encounter.isSigned = true;
            encounter.signedAt = signedAt;
            encounter.signedBy = signedBy;
            encounter.status = 'signed';
            encounter.signatureVersion = '1';
            if (!encounter.endTime) encounter.endTime = signedAt;
            encounter.signatureHash = createHash('sha256').update(JSON.stringify([
                'sigha-clinical-v1', 'encounter', encounter.id, context.tenantId,
                encounter.idOlderAdult, encounter.soSubjective ?? null,
                encounter.soObjective ?? null, encounter.soAssessment ?? null,
                encounter.soPlan ?? null, signedBy, signedAt.toISOString(),
            ])).digest('hex');

            return repository.save(encounter);
        });
    }

    async createAddendum(idEncounter: number, signedBy: number, dto: CreateNoteAddendumDto): Promise<ClinicalNoteAddendum> {
        const context = getTenantContext();
        if (!context) throw new BadRequestException('No se encontró el contexto de organización de la firma');

        return this.addendumRepository.manager.transaction(async (manager) => {
            const encounter = await manager.getRepository(ClinicalEncounter).findOne({
                where: { id: idEncounter },
                lock: { mode: 'pessimistic_read' },
            });
            if (!encounter) throw new NotFoundException(`Encuentro clínico con ID ${idEncounter} no encontrado`);
            if (!encounter.isSigned || encounter.status !== 'signed') {
                throw new BadRequestException(
                    'Solo se pueden añadir addendums a notas clínicas que ya hayan sido cerradas y firmadas.'
                );
            }

            const signedAt = new Date();
            const signatureHash = createHash('sha256').update(JSON.stringify([
                'sigha-clinical-v1', 'addendum', idEncounter, context.tenantId,
                dto.addendumText, dto.reasonForAddendum, signedBy, signedAt.toISOString(),
            ])).digest('hex');
            const addendum = manager.getRepository(ClinicalNoteAddendum).create({
                idEncounter,
                authorId: signedBy,
                signedBy,
                addendumText: dto.addendumText,
                reasonForAddendum: dto.reasonForAddendum,
                signedAt,
                signatureHash,
                signatureVersion: '1',
                status: 'signed',
            });

            return manager.getRepository(ClinicalNoteAddendum).save(addendum);
        });
    }
}
