import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Between, FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { getTenantContext } from '../../common/tenant/tenant-context';
import { OlderAdult } from '../../domain/virtual-records';
import { AccessLog } from '../../domain/access-logs';
import { AccessLogFilterDto, CreateAccessLogDto } from '../../dto/access-logs';

@Injectable()
export class AccessLogsService {
  constructor(
    @Inject('AccessLogRepository') private readonly accessLogRepo: Repository<AccessLog>,
    @Inject('AccessLogOlderAdultRepository') private readonly residentRepo: Repository<OlderAdult>,
  ) {}

  async findAll(filter: AccessLogFilterDto) {
    const context = this.requireTenantContext();
    const from = filter.from ? new Date(filter.from) : undefined;
    const to = filter.to ? new Date(filter.to) : undefined;
    if (from && to && from > to) throw new BadRequestException('La fecha inicial debe ser anterior a la fecha final.');

    const where: FindOptionsWhere<AccessLog> = { tenantId: context.tenantId };
    if (filter.eventType) where.eventType = filter.eventType;
    if (filter.residentId) where.idOlderAdult = filter.residentId;
    if (filter.visitorName) where.visitorName = ILike(`%${filter.visitorName.trim()}%`);
    if (from && to) where.occurredAt = Between(from, to);
    else if (from) where.occurredAt = MoreThanOrEqual(from);
    else if (to) where.occurredAt = LessThanOrEqual(to);

    const page = filter.page || 1;
    const limit = filter.limit || 25;
    const [rows, total] = await this.accessLogRepo.findAndCount({
      where,
      order: { occurredAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const residentIds = [...new Set(rows.flatMap((row) => row.idOlderAdult ? [row.idOlderAdult] : []))];
    const residents = residentIds.length ? await this.residentRepo.findBy({ id: In(residentIds) }) : [];
    const residentsById = new Map(residents.map((resident) => [resident.id, resident]));

    return {
      data: rows.map((row) => {
        const resident = row.idOlderAdult ? residentsById.get(row.idOlderAdult) : undefined;
        return {
          ...row,
          resident: resident ? {
            id: resident.id,
            name: [resident.oaName, resident.oaFLastName, resident.oaSLastName].filter(Boolean).join(' '),
          } : null,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async create(dto: CreateAccessLogDto, actorId: number) {
    const context = this.requireTenantContext();
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();
    const expectedReturnAt = dto.expectedReturnAt ? new Date(dto.expectedReturnAt) : null;

    if (occurredAt > new Date()) {
      throw new BadRequestException('La fecha del movimiento no puede estar en el futuro.');
    }

    if (dto.eventType !== 'visit' && !dto.residentId) {
      throw new BadRequestException('Seleccione el residente para registrar una salida o un regreso.');
    }
    if (dto.eventType === 'visit' && !dto.visitorName?.trim() && !dto.residentId) {
      throw new BadRequestException('Indique el nombre de la persona visitante o el residente asociado.');
    }
    if (expectedReturnAt && dto.eventType !== 'exit') {
      throw new BadRequestException('La fecha estimada de regreso solo aplica a una salida.');
    }
    if (expectedReturnAt && expectedReturnAt < occurredAt) {
      throw new BadRequestException('La fecha estimada de regreso no puede ser anterior a la salida.');
    }
    if (dto.residentId) {
      const resident = await this.residentRepo.findOne({ where: { id: dto.residentId } });
      if (!resident) throw new NotFoundException(`Residente ${dto.residentId} no encontrado.`);
    }

    return this.accessLogRepo.save(this.accessLogRepo.create({
      tenantId: context.tenantId,
      idOlderAdult: dto.residentId ?? null,
      eventType: dto.eventType,
      occurredAt,
      expectedReturnAt,
      visitorName: dto.eventType === 'visit' ? dto.visitorName?.trim() || null : null,
      notes: dto.notes?.trim() || null,
      recordedBy: actorId,
    }));
  }

  private requireTenantContext() {
    const context = getTenantContext();
    if (!context) throw new BadRequestException('No se encontró el contexto de organización activo.');
    return context;
  }
}
