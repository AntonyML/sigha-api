import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';
import { ResidentMemo, ResidentMemoAcknowledgment, MemoCategory, MemoStatus, MemoUrgency, MemoVisibility } from '../../domain/memos';
import { CreateMemoDto, UpdateMemoStatusDto } from '../../dto/memos';
import type { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import { User } from '../../domain/auth/core/user.entity';
import { Role } from '../../domain/auth/core/role.entity';
import { MailerService } from '../email/mailer.service';

@Injectable()
export class MemosService {
    private readonly logger = new Logger(MemosService.name);

    constructor(
        @Inject('ResidentMemoRepository')
        private readonly memoRepository: Repository<ResidentMemo>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<any>,
        @Inject('UserRepository')
        private readonly userRepository: Repository<User>,
        @Inject('RoleRepository')
        private readonly roleRepository: Repository<Role>,
        @Inject('ResidentMemoAcknowledgmentRepository')
        private readonly ackRepository: Repository<ResidentMemoAcknowledgment>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async createMemo(dto: CreateMemoDto, authorId: number): Promise<ResidentMemo> {
        const olderAdult = await this.olderAdultRepository.findOne({
            where: { id: dto.olderAdultId },
        });
        if (!olderAdult) {
            throw new NotFoundException(`Adulto mayor con ID ${dto.olderAdultId} no encontrado`);
        }

        const author = await this.userRepository.findOne({
            where: { id: authorId },
        });
        if (!author) {
            throw new NotFoundException(`Usuario autor con ID ${authorId} no encontrado`);
        }

        const memo = this.memoRepository.create({
            olderAdultId: dto.olderAdultId,
            authorId,
            targetUserId: dto.targetUserId ?? null,
            targetRoleId: dto.targetRoleId ?? null,
            parentMemoId: dto.parentMemoId ?? null,
            content: dto.content,
            category: dto.category ?? MemoCategory.GENERAL,
            visibility: dto.visibility ?? MemoVisibility.PUBLIC,
            urgency: dto.urgency ?? MemoUrgency.ROUTINE,
            status: MemoStatus.OPEN,
            attachments: dto.attachments ?? [],
            isEdited: false,
        });

        const savedMemo = await this.memoRepository.save(memo);

        // Disparo asíncrono no bloqueante de notificación vía Mailbridge
        if (dto.targetUserId || dto.targetRoleId) {
            void this.dispatchReferralNotification(savedMemo, author, olderAdult, dto).catch((err) => {
                this.logger.error(
                    '[MemosService] Error enviando notificación de memo vía Mailbridge',
                    sanitizeForLogging({ memoId: savedMemo.id, err: err instanceof Error ? err.message : String(err) })
                );
            });
        }

        return this.findOneById(savedMemo.id);
    }

    private async dispatchReferralNotification(
        memo: ResidentMemo,
        author: User,
        olderAdult: OlderAdult,
        dto: CreateMemoDto
    ): Promise<void> {
        if (!this.mailerService.isEnabled()) {
            this.logger.warn('[MemosService] MailerService no está habilitado, omitiendo notificación por correo');
            return;
        }

        const recipientEmails = new Set<string>();
        let targetName = 'Equipo Interdepartamental';

        if (dto.targetUserId) {
            const targetUser = await this.userRepository.findOne({ where: { id: dto.targetUserId } });
            if (targetUser?.uEmail && targetUser.uIsActive) {
                recipientEmails.add(targetUser.uEmail);
                targetName = `${targetUser.uName} ${targetUser.uFLastName}`.trim();
            }
        }

        if (dto.targetRoleId) {
            const role = await this.roleRepository.findOne({ where: { id: dto.targetRoleId } });
            if (role) {
                targetName = role.rName;
            }
            // Encontrar usuarios activos con este rol mediante query builder
            const roleUsers = await this.userRepository
                .createQueryBuilder('u')
                .innerJoin('u.userRoles', 'ur')
                .where('ur.role_id = :roleId', { roleId: dto.targetRoleId })
                .andWhere('u.u_is_active = true')
                .getMany();

            roleUsers.forEach((u) => {
                if (u.uEmail) recipientEmails.add(u.uEmail);
            });
        }

        if (recipientEmails.size === 0) {
            return;
        }

        const urgencyLabelMap: Record<MemoUrgency, string> = {
            [MemoUrgency.ROUTINE]: 'RUTINA',
            [MemoUrgency.PRIORITY]: 'PRIORITARIA',
            [MemoUrgency.URGENT]: 'URGENTE',
        };

        const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://sigha.app').replace(/\/$/, '');
        const actionUrl = `${frontendUrl}/virtualFiles/view?id=${olderAdult.id}&tab=memos`;
        const patientName = `${olderAdult.oaName} ${olderAdult.oaFLastName}`.trim();
        const authorName = `${author.uName} ${author.uFLastName}`.trim();

        for (const to of recipientEmails) {
            await this.mailerService.sendMail({
                to,
                template: 'internal-referral-memo',
                variables: {
                    patientName,
                    authorName,
                    authorRole: 'Profesional',
                    targetDepartmentOrUser: targetName,
                    urgencyLabel: urgencyLabelMap[memo.urgency] ?? 'RUTINA',
                    memoContent: memo.content,
                    actionUrl,
                },
            });
        }
    }

    async getByOlderAdult(
        olderAdultId: number,
        currentUserId?: number,
        currentUserRole?: string
    ): Promise<ResidentMemo[]> {
        const memos = await this.memoRepository.find({
            where: { olderAdultId },
            relations: ['author', 'targetUser', 'targetRole'],
            order: { createdAt: 'DESC' },
        });

        // Visibilidad clínica y confidencial
        const isSuperRole = ['super admin', 'admin', 'director'].includes((currentUserRole || '').toLowerCase());
        const isClinicalRole = isSuperRole || ['nurse', 'psychologist', 'physiotherapist', 'social worker'].includes((currentUserRole || '').toLowerCase());

        return memos.filter((memo) => {
            if (memo.visibility === MemoVisibility.CONFIDENTIAL) {
                return isSuperRole || (currentUserId && memo.authorId === currentUserId);
            }
            if (memo.visibility === MemoVisibility.CLINICAL) {
                return isClinicalRole;
            }
            return true;
        });
    }

    async findOneById(id: number): Promise<ResidentMemo> {
        const memo = await this.memoRepository.findOne({
            where: { id },
            relations: ['author', 'targetUser', 'targetRole'],
        });
        if (!memo) {
            throw new NotFoundException(`Memo con ID ${id} no encontrado`);
        }
        return memo;
    }

    async updateStatus(id: number, dto: UpdateMemoStatusDto, userId: number): Promise<ResidentMemo> {
        const memo = await this.findOneById(id);
        memo.status = dto.status;
        if (dto.status === MemoStatus.RESOLVED) {
            memo.resolvedAt = new Date();
            memo.resolvedBy = userId;
        }
        return this.memoRepository.save(memo);
    }

    async acknowledgeMemo(memoId: number, userId: number, notes?: string): Promise<ResidentMemoAcknowledgment> {
        await this.findOneById(memoId);
        const existing = await this.ackRepository.findOne({ where: { memoId, userId } });
        if (existing) {
            existing.acknowledgedAt = new Date();
            if (notes) existing.notes = notes;
            return this.ackRepository.save(existing);
        }

        const ack = this.ackRepository.create({
            memoId,
            userId,
            acknowledgedAt: new Date(),
            notes: notes ?? null,
        });
        return this.ackRepository.save(ack);
    }
}
