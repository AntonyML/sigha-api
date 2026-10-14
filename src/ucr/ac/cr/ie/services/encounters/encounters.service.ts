import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClinicalEncounter, ClinicalNoteAddendum } from '../../domain/encounters';
import {
    CreateEncounterDto,
    UpdateEncounterSoapDto,
    SignEncounterDto,
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
        const encounter = await this.findById(id);

        // GNU Health / HL7 FHIR principle: Once signed, notes are strictly immutable!
        if (encounter.isSigned) {
            throw new BadRequestException(
                'La nota clínica ya ha sido firmada y es inmutable. Para corregir o añadir observaciones utilice un addendum (enmienda).'
            );
        }

        if (dto.status) encounter.status = dto.status;
        if (dto.endTime) encounter.endTime = new Date(dto.endTime);
        if (dto.soSubjective !== undefined) encounter.soSubjective = dto.soSubjective;
        if (dto.soObjective !== undefined) encounter.soObjective = dto.soObjective;
        if (dto.soAssessment !== undefined) encounter.soAssessment = dto.soAssessment;
        if (dto.soPlan !== undefined) encounter.soPlan = dto.soPlan;

        return this.encounterRepository.save(encounter);
    }

    async signEncounter(id: number, dto: SignEncounterDto): Promise<ClinicalEncounter> {
        const encounter = await this.findById(id);

        if (encounter.isSigned) {
            throw new BadRequestException('El encuentro ya se encuentra debidamente firmado');
        }

        encounter.isSigned = true;
        encounter.signedAt = new Date();
        encounter.signedBy = dto.signedBy;
        encounter.status = 'completed';
        if (!encounter.endTime) {
            encounter.endTime = new Date();
        }

        return this.encounterRepository.save(encounter);
    }

    async createAddendum(dto: CreateNoteAddendumDto): Promise<ClinicalNoteAddendum> {
        const encounter = await this.findById(dto.idEncounter);

        if (!encounter.isSigned) {
            throw new BadRequestException(
                'Solo se pueden añadir addendums a notas clínicas que ya hayan sido cerradas y firmadas.'
            );
        }

        const addendum = this.addendumRepository.create({
            idEncounter: dto.idEncounter,
            authorId: dto.authorId,
            addendumText: dto.addendumText,
            reasonForAddendum: dto.reasonForAddendum,
            signedAt: new Date()
        });

        return this.addendumRepository.save(addendum);
    }
}
