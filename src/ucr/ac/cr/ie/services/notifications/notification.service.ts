import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification, NotificationAttachment } from '../../domain/notifications';
import { CreateNotificationDto, UpdateNotificationDto, SearchNotificationDto } from '../../dto/notifications';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditReportType } from '../../domain/audit';

@Injectable()
export class NotificationService {
    constructor(
        @Inject('NotificationRepository')
        private notificationRepository: Repository<Notification>,
        @Inject('NotificationAttachmentRepository')
        private notificationAttachmentRepository: Repository<NotificationAttachment>,
        private readonly auditService: AuditService,
    ) { }

    /**
     * Crear una nueva notificación
     */
    async create(createNotificationDto: CreateNotificationDto, userId: number): Promise<Notification> {
        const { nTitle, nMessage, nSendDate, nSent, attachments } = createNotificationDto;

        // Validar tamaño de archivos adjuntos (máximo 5MB total)
        if (attachments && attachments.length > 0) {
            const totalSize = attachments.reduce((sum, att) => sum + att.naFileSizeKb, 0);
            if (totalSize > 5120) { // 5MB = 5120KB
                throw new BadRequestException('El tamaño total de los archivos adjuntos no puede exceder 5MB');
            }
        }

        // Procesar fecha de envío
        const sendDate = nSendDate ? new Date(nSendDate) : new Date();

        // Crear la notificación
        const notification = this.notificationRepository.create({
            nTitle,
            nMessage,
            nSendDate: sendDate,
            nSent: nSent ?? false,
            idSender: userId,
        });

        const savedNotification = await this.notificationRepository.save(notification);

        // Crear adjuntos si existen
        if (attachments && attachments.length > 0) {
            const attachmentEntities = attachments.map(att =>
                this.notificationAttachmentRepository.create({
                    ...att,
                    idNotification: savedNotification.id,
                })
            );
            await this.notificationAttachmentRepository.save(attachmentEntities);
        }

        // Auditoría
        try {
            await this.auditService.createDigitalRecord(userId, {
                action: AuditAction.CREATE,
                tableName: 'notifications',
                recordId: savedNotification.id,
                description: `Notificación "${savedNotification.nTitle}" creada`,
            });
        } catch (e) {
            console.error('Audit error (notifications):', e);
        }

        return savedNotification;
    }

    /**
     * Obtener todas las notificaciones con filtros y paginación
     */
    async findAll(searchDto: SearchNotificationDto): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
        const { search, sendDateFrom, sendDateTo, nSent, idSender, page = 1, limit = 10 } = searchDto;

        const queryBuilder = this.notificationRepository
            .createQueryBuilder('n')
            .leftJoinAndSelect('n.sender', 'sender')
            .leftJoinAndSelect('n.attachments', 'attachments');

        // Filtros
        if (search) {
            queryBuilder.andWhere('(n.nTitle LIKE :search OR n.nMessage LIKE :search)', { search: `%${search}%` });
        }

        if (sendDateFrom) {
            queryBuilder.andWhere('n.nSendDate >= :sendDateFrom', { sendDateFrom: new Date(sendDateFrom) });
        }

        if (sendDateTo) {
            queryBuilder.andWhere('n.nSendDate <= :sendDateTo', { sendDateTo: new Date(sendDateTo) });
        }

        if (nSent !== undefined) {
            queryBuilder.andWhere('n.nSent = :nSent', { nSent });
        }

        if (idSender) {
            queryBuilder.andWhere('n.idSender = :idSender', { idSender });
        }

        // Paginación
        queryBuilder
            .orderBy('n.nSendDate', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total, page, limit };
    }

    /**
     * Obtener notificación por ID
     */
    async findOne(id: number): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
            relations: ['sender', 'attachments'],
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        return notification;
    }

    /**
     * Actualizar notificación
     */
    async update(id: number, updateNotificationDto: UpdateNotificationDto, userId: number): Promise<Notification> {
        const notification = await this.findOne(id);

        // Actualizar campos
        if (updateNotificationDto.nTitle) notification.nTitle = updateNotificationDto.nTitle;
        if (updateNotificationDto.nMessage) notification.nMessage = updateNotificationDto.nMessage;
        if (updateNotificationDto.nSendDate) notification.nSendDate = new Date(updateNotificationDto.nSendDate);

        // Manejar adjuntos (simplificado - en producción, manejar reemplazo completo)
        if (updateNotificationDto.attachments) {
            // Eliminar adjuntos existentes
            await this.notificationAttachmentRepository.delete({ idNotification: id });

            // Crear nuevos
            const attachmentEntities = updateNotificationDto.attachments.map(att =>
                this.notificationAttachmentRepository.create({
                    ...att,
                    idNotification: id,
                })
            );
            await this.notificationAttachmentRepository.save(attachmentEntities);
        }

        const updated = await this.notificationRepository.save(notification);

        // Auditoría
        try {
            await this.auditService.createDigitalRecord(userId, {
                action: AuditAction.DELETE,
                tableName: 'notifications',
                recordId: id,
                description: `Notificación "${notification.nTitle}" eliminada`,
            });
        } catch (e) {
            console.error('Audit error (notifications):', e);
        }

        return updated;
    }

    /**
     * Eliminar notificación
     */
    async remove(id: number, userId: number): Promise<void> {
        const notification = await this.findOne(id);

        // Eliminar adjuntos (y archivos físicos si es necesario)
        await this.notificationAttachmentRepository.delete({ idNotification: id });

        // Eliminar notificación
        await this.notificationRepository.remove(notification);

        // Auditoría
        try {
            await this.auditService.createDigitalRecord(userId, {
                action: AuditAction.DELETE,
                tableName: 'notifications',
                recordId: id,
                description: `Notificación "${notification.nTitle}" eliminada`,
            });
        } catch (e) {
            console.error('Audit error (notifications):', e);
        }
    }
}