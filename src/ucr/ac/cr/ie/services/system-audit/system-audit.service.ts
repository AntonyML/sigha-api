import { Inject, Injectable } from '@nestjs/common';
import { Between, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { SysAuditLog } from '../../domain/system-audit';
import { SystemAuditFilterDto } from '../../dto/system-audit';
import { BadRequestException } from '@nestjs/common';
import { getTenantContext } from '../../common/tenant/tenant-context';

@Injectable()
export class SystemAuditService {
  constructor(
    @Inject('SysAuditLogRepository') private readonly auditRepo: Repository<SysAuditLog>,
    @Inject('SystemAuditUserRepository') private readonly userRepo: Repository<User>,
  ) {}

  async findAll(filter: SystemAuditFilterDto) {
    const context = getTenantContext();
    if (!context) throw new BadRequestException('No se encontró el contexto de organización activo.');
    const from = filter.from ? new Date(filter.from) : undefined;
    const to = filter.to ? new Date(filter.to) : undefined;
    const where: FindOptionsWhere<SysAuditLog> = { tenantId: context.tenantId };
    if (filter.tableName) where.tableName = filter.tableName.trim();
    if (filter.recordId) where.recordId = filter.recordId.trim();
    if (filter.action) where.action = filter.action;
    if (filter.actorUserId) where.actorUserId = filter.actorUserId;
    if (from && to) where.occurredAt = Between(from, to);
    else if (from) where.occurredAt = MoreThanOrEqual(from);
    else if (to) where.occurredAt = LessThanOrEqual(to);

    const page = filter.page || 1;
    const limit = filter.limit || 25;
    const [rows, total] = await this.auditRepo.findAndCount({
      where,
      order: { occurredAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const actorIds = [...new Set(rows.flatMap((row) => row.actorUserId ? [row.actorUserId] : []))];
    const actors = actorIds.length ? await this.userRepo.findBy({ id: In(actorIds) }) : [];
    const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

    return {
      data: rows.map((row) => {
        const actor = row.actorUserId ? actorsById.get(row.actorUserId) : undefined;
        return {
          ...row,
          actor: actor ? {
            id: actor.id,
            name: [actor.uName, actor.uFLastName, actor.uSLastName].filter(Boolean).join(' '),
            email: actor.uEmail,
          } : null,
        };
      }),
      total,
      page,
      limit,
    };
  }
}
