import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ClinicalEncounter, ClinicalScaleEvaluation, ClinicalScaleType } from '../../domain/encounters';

export interface SpecialtyScaleInput {
    idOlderAdult: number;
    evaluatorId: number;
    idEncounter?: number;
    encounterType: 'physiotherapy' | 'psychology' | 'social_work';
    scaleType: ClinicalScaleType;
    totalScore: number;
    interpretation: string;
    responses: Record<string, unknown>;
    specialtyPayload: Record<string, unknown>;
}

export async function persistSpecialtyScale(
    manager: EntityManager,
    input: SpecialtyScaleInput,
): Promise<{ encounter: ClinicalEncounter; scale: ClinicalScaleEvaluation }> {
    const encounterRepository = manager.getRepository(ClinicalEncounter);
    let encounter: ClinicalEncounter;

    if (input.idEncounter) {
        const existing = await encounterRepository.findOne({
            where: { id: input.idEncounter, idOlderAdult: input.idOlderAdult },
            lock: { mode: 'pessimistic_write' },
        });
        if (!existing) throw new NotFoundException(`Encuentro clínico ${input.idEncounter} no encontrado para el residente`);
        if (existing.isSigned || existing.status === 'signed') {
            throw new BadRequestException('No se puede agregar una escala a un encuentro clínico firmado');
        }
        existing.specialtyPayload = {
            ...(existing.specialtyPayload ?? {}),
            [input.encounterType]: input.specialtyPayload,
        };
        encounter = await encounterRepository.save(existing);
    } else {
        encounter = await encounterRepository.save(encounterRepository.create({
            idOlderAdult: input.idOlderAdult,
            idProfessional: input.evaluatorId,
            encounterClass: 'ambulatory',
            encounterType: input.encounterType,
            status: 'completed',
            startTime: new Date(),
            isSigned: false,
            specialtyPayload: { [input.encounterType]: input.specialtyPayload },
        }));
    }

    const scaleRepository: Repository<ClinicalScaleEvaluation> = manager.getRepository(ClinicalScaleEvaluation);
    const scale = await scaleRepository.save(scaleRepository.create({
        encounterId: encounter.id,
        idOlderAdult: input.idOlderAdult,
        scaleType: input.scaleType,
        totalScore: input.totalScore,
        interpretation: input.interpretation,
        responsesPayload: input.responses,
        evaluatedAt: new Date(),
        evaluatedBy: input.evaluatorId,
    }));

    return { encounter, scale };
}

export function specialtyScaleResponse(
    encounter: ClinicalEncounter,
    scale: ClinicalScaleEvaluation,
    specialty: SpecialtyScaleInput['encounterType'],
): Record<string, unknown> {
    const payload = encounter.specialtyPayload?.[specialty];
    return {
        ...(payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}),
        id: encounter.id,
        encounterId: encounter.id,
        scaleEvaluationId: scale.id,
        idOlderAdult: encounter.idOlderAdult,
        idEncounter: encounter.id,
        evaluatorId: encounter.idProfessional,
        evaluationDate: encounter.startTime,
        totalScore: Number(scale.totalScore),
        interpretation: scale.interpretation,
        responses: scale.responsesPayload,
        evaluator: encounter.professional,
        encounter,
    };
}
