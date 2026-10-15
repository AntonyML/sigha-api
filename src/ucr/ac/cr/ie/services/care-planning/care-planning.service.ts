import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { getTenantContext } from '../../common/tenant/tenant-context';
import { ClinicalScaleEvaluation } from '../../domain/encounters';
import { OlderAdult } from '../../domain/virtual-records';
import {
  CareProgram,
  CareSubProgram,
  ResidentProgramEnrollment,
} from '../../domain/care-planning';
import {
  CreateCareProgramDto,
  CreateCareSubProgramDto,
  CreateResidentProgramEnrollmentDto,
  ResidentProgramEnrollmentFilterDto,
  UpdateResidentProgramEnrollmentDto,
} from '../../dto/care-planning';

@Injectable()
export class CarePlanningService {
  constructor(
    @Inject('CareProgramRepository') private readonly programRepo: Repository<CareProgram>,
    @Inject('CareSubProgramRepository') private readonly subprogramRepo: Repository<CareSubProgram>,
    @Inject('ResidentProgramEnrollmentRepository') private readonly enrollmentRepo: Repository<ResidentProgramEnrollment>,
    @Inject('ClinicalScaleEvaluationRepository') private readonly scaleRepo: Repository<ClinicalScaleEvaluation>,
    @Inject('OlderAdultRepository') private readonly residentRepo: Repository<OlderAdult>,
  ) {}

  async getCatalog() {
    const context = this.requireTenantContext();
    const [programs, subprograms] = await Promise.all([
      this.programRepo.find({ where: { tenantId: context.tenantId, isActive: true }, order: { name: 'ASC' } }),
      this.subprogramRepo.find({ where: { tenantId: context.tenantId, isActive: true }, order: { name: 'ASC' } }),
    ]);
    return programs.map((program) => ({
      ...program,
      subprograms: subprograms.filter((subprogram) => subprogram.programId === program.id),
    }));
  }

  async createProgram(dto: CreateCareProgramDto) {
    const context = this.requireTenantContext();
    try {
      return await this.programRepo.save(this.programRepo.create({
        tenantId: context.tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: true,
      }));
    } catch (error) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Ya existe un programa de cuidado con ese nombre.');
      throw error;
    }
  }

  async createSubprogram(dto: CreateCareSubProgramDto) {
    const context = this.requireTenantContext();
    const program = await this.programRepo.findOne({ where: { id: dto.programId, tenantId: context.tenantId, isActive: true } });
    if (!program) throw new NotFoundException('El programa de cuidado no existe o está inactivo.');
    try {
      return await this.subprogramRepo.save(this.subprogramRepo.create({
        tenantId: context.tenantId,
        programId: program.id,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: true,
      }));
    } catch (error) {
      if (this.isUniqueViolation(error)) throw new ConflictException('Ya existe ese subprograma dentro del programa.');
      throw error;
    }
  }

  async getScaleEvaluations(residentId: number) {
    const context = this.requireTenantContext();
    const resident = await this.residentRepo.findOne({ where: { id: residentId } });
    if (!resident) throw new NotFoundException(`Residente ${residentId} no encontrado.`);
    const evaluations = await this.scaleRepo.find({
      where: { tenantId: context.tenantId, idOlderAdult: residentId },
      order: { evaluatedAt: 'DESC' },
      take: 100,
    });
    return evaluations.map((evaluation) => ({
      id: evaluation.id,
      scaleType: evaluation.scaleType,
      totalScore: Number(evaluation.totalScore),
      interpretation: evaluation.interpretation,
      evaluatedAt: evaluation.evaluatedAt,
      encounterId: evaluation.encounterId ?? null,
    }));
  }

  async getEnrollments(filter: ResidentProgramEnrollmentFilterDto) {
    const context = this.requireTenantContext();
    const where: Record<string, unknown> = { tenantId: context.tenantId };
    if (filter.residentId) where.idOlderAdult = filter.residentId;
    if (filter.status) where.status = filter.status;
    const enrollments = await this.enrollmentRepo.find({
      where,
      order: { startedAt: 'DESC', id: 'DESC' },
    });
    if (enrollments.length === 0) return [];

    const subprogramIds = [...new Set(enrollments.map((row) => row.subprogramId))];
    const residentIds = [...new Set(enrollments.map((row) => row.idOlderAdult))];
    const programIds = new Set<number>();
    const scaleIds = [...new Set(enrollments.flatMap((row) => row.scaleEvaluationId ? [row.scaleEvaluationId] : []))];
    const [subprograms, residents, evaluations] = await Promise.all([
      this.subprogramRepo.findBy({ id: In(subprogramIds), tenantId: context.tenantId }),
      this.residentRepo.findBy({ id: In(residentIds) }),
      scaleIds.length ? this.scaleRepo.findBy({ id: In(scaleIds), tenantId: context.tenantId }) : Promise.resolve([]),
    ]);
    for (const subprogram of subprograms) programIds.add(subprogram.programId);
    const programs = programIds.size ? await this.programRepo.findBy({ id: In([...programIds]), tenantId: context.tenantId }) : [];
    const subprogramById = new Map(subprograms.map((row) => [row.id, row]));
    const residentById = new Map(residents.map((row) => [row.id, row]));
    const programById = new Map(programs.map((row) => [row.id, row]));
    const evaluationById = new Map(evaluations.map((row) => [row.id, row]));

    return enrollments.map((enrollment) => {
      const subprogram = subprogramById.get(enrollment.subprogramId);
      const resident = residentById.get(enrollment.idOlderAdult);
      const evaluation = enrollment.scaleEvaluationId ? evaluationById.get(enrollment.scaleEvaluationId) : undefined;
      return {
        ...enrollment,
        resident: resident ? {
          id: resident.id,
          name: [resident.oaName, resident.oaFLastName, resident.oaSLastName].filter(Boolean).join(' '),
        } : null,
        subprogram: subprogram ? {
          id: subprogram.id,
          name: subprogram.name,
          programId: subprogram.programId,
          programName: programById.get(subprogram.programId)?.name ?? null,
        } : null,
        scaleEvaluation: evaluation ? {
          id: evaluation.id,
          scaleType: evaluation.scaleType,
          totalScore: Number(evaluation.totalScore),
          interpretation: evaluation.interpretation,
          evaluatedAt: evaluation.evaluatedAt,
        } : null,
      };
    });
  }

  async createEnrollment(dto: CreateResidentProgramEnrollmentDto, actorId: number) {
    const context = this.requireTenantContext();
    const resident = await this.residentRepo.findOne({ where: { id: dto.residentId } });
    if (!resident) throw new NotFoundException(`Residente ${dto.residentId} no encontrado.`);
    const subprogram = await this.subprogramRepo.findOne({ where: { id: dto.subprogramId, tenantId: context.tenantId, isActive: true } });
    if (!subprogram) throw new NotFoundException('El subprograma de cuidado no existe o está inactivo.');
    await this.validateScaleEvaluation(dto.scaleEvaluationId, dto.residentId, context.tenantId);

    return this.enrollmentRepo.save(this.enrollmentRepo.create({
      tenantId: context.tenantId,
      idOlderAdult: dto.residentId,
      subprogramId: dto.subprogramId,
      scaleEvaluationId: dto.scaleEvaluationId ?? null,
      goals: dto.goals?.trim() || null,
      status: 'active',
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      endedAt: null,
      createdBy: actorId,
    }));
  }

  async updateEnrollment(id: number, dto: UpdateResidentProgramEnrollmentDto) {
    const context = this.requireTenantContext();
    const enrollment = await this.enrollmentRepo.findOne({ where: { id, tenantId: context.tenantId } });
    if (!enrollment) throw new NotFoundException(`Inscripción ${id} no encontrada.`);
    await this.validateScaleEvaluation(dto.scaleEvaluationId, enrollment.idOlderAdult, context.tenantId);

    if (dto.status) enrollment.status = dto.status;
    if (dto.goals !== undefined) enrollment.goals = dto.goals.trim() || null;
    if (dto.scaleEvaluationId !== undefined) enrollment.scaleEvaluationId = dto.scaleEvaluationId;
    if (dto.startedAt) enrollment.startedAt = new Date(dto.startedAt);

    if (enrollment.status === 'active') {
      enrollment.endedAt = null;
    } else if (dto.endedAt) {
      enrollment.endedAt = new Date(dto.endedAt);
    } else if (!enrollment.endedAt) {
      enrollment.endedAt = new Date();
    }

    if (enrollment.endedAt && enrollment.endedAt < enrollment.startedAt) {
      throw new BadRequestException('La fecha de finalización no puede ser anterior a la fecha de inicio.');
    }
    return this.enrollmentRepo.save(enrollment);
  }

  private async validateScaleEvaluation(evaluationId: number | undefined, residentId: number, tenantId: number): Promise<void> {
    if (!evaluationId) return;
    const evaluation = await this.scaleRepo.findOne({ where: { id: evaluationId, tenantId, idOlderAdult: residentId } });
    if (!evaluation) {
      throw new BadRequestException('La evaluación clínica seleccionada no pertenece al residente.');
    }
  }

  private requireTenantContext() {
    const context = getTenantContext();
    if (!context) throw new BadRequestException('No se encontró el contexto de organización activo.');
    return context;
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error
      && (error as { code?: string }).code === '23505';
  }
}
