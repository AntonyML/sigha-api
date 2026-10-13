import { Injectable, BadRequestException, NotFoundException, Inject, Optional } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { LoggerService } from '@common/services/logger.service';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';
import { Notification, type NotificationAttachment } from '../../domain/notifications';
import { NotificationStatus } from '../../domain/notifications/notification-status.enum';
import { CreateNotificationDto, UpdateNotificationDto, SearchNotificationDto } from '../../dto/notifications';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditReportType } from '../../domain/audit';

@Injectable()
export class NotificationService {
    constructor(
        private logger: LoggerService,
        @Inject('NotificationRepository')
        private notificationRepository: Repository<Notification>,
        @Inject('NotificationAttachmentRepository')
        private notificationAttachmentRepository: Repository<NotificationAttachment>,
        private readonly auditService: AuditService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Optional()
        @Inject('DataSource')
        private dataSource?: DataSource,
    ) { }

    /** TTL (ms) de la caché de listado de notificaciones por usuario */
    private static readonly UNREAD_CACHE_TTL_MS = 15000;

    /**
     * Versión global de invalidación de la caché de listados.
     * Incrementarla invalida de forma atómica todas las claves emitidas
     * (`notifications-unread:<usuario>:v<versión>:<filtros>`) sin necesidad
     * de borrados por wildcard; las claves obsoletas expiran por TTL.
     * Limitación: al residir en memoria es por proceso; con múltiples
     * instancias conviene mover la versión al propio store (p. ej. Redis).
     */
    private unreadCacheVersion = 0;

    /**
     * Invalida todos los listados cacheados de notificaciones no leídas.
     */
    private invalidateUnreadCache(): void {
        this.unreadCacheVersion++;
    }

    /**
     * Construye la clave de caché por usuario y filtros de búsqueda.
     */
    private unreadCacheKey(userId: number, searchDto: SearchNotificationDto): string {
        const { search, sendDateFrom, sendDateTo, nSent, idSender, page = 1, limit = 10 } = searchDto;
        const fingerprint = JSON.stringify({ search, sendDateFrom, sendDateTo, nSent, idSender, page, limit });
        return `notifications-unread:${userId}:v${this.unreadCacheVersion}:${fingerprint}`;
    }

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
                    this.logger.error('Audit error (notifications create)', sanitizeForLogging({ error: String(e) }));
                }

                // Invalidar caché de listados (versión global) y la del creador
                this.invalidateUnreadCache();
                await this.invalidateUserUnreadCache(userId);

                return savedNotification;
    }

    /**
     * Obtener todas las notificaciones con filtros y paginación
     */
    async findAll(searchDto: SearchNotificationDto, userId: number = 0): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
        const cacheKey = this.unreadCacheKey(userId, searchDto);
        const cached = await this.cacheManager.get<{ data: Notification[]; total: number; page: number; limit: number }>(cacheKey);
        if (cached) {
            return cached;
        }

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

        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, NotificationService.UNREAD_CACHE_TTL_MS);

        return result;
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
                        action: AuditAction.UPDATE,
                        tableName: 'notifications',
                        recordId: id,
                        description: `Notificación "${notification.nTitle}" actualizada`,
                    });
                } catch (e) {
                    this.logger.error('Audit error (notifications update)', sanitizeForLogging({ error: String(e) }));
                }

                // Invalidar caché de listados (versión global) y la de los usuarios implicados
                this.invalidateUnreadCache();
                await this.invalidateUserUnreadCache(userId, notification.idSender);

                return updated;
    }

    /**
     * Marcar notificación como leída con control de concurrencia mediante transacción
     * y bloqueo pesimista a nivel de fila (pessimistic_write).
     */
    async markAsRead(id: number, userId: number): Promise<Notification> {
        const executeMarkAsRead = async (
            findFn: (targetId: number) => Promise<Notification | null>,
            saveFn: (entity: Notification) => Promise<Notification>,
        ): Promise<{ notification: Notification; wasAlreadyRead: boolean }> => {
            const notification = await findFn(id);

            if (!notification) {
                throw new NotFoundException('Notificación no encontrada');
            }

            // Operación idempotente: si ya estaba leída por otra transacción concurrente, no duplicar mutación ni auditoría
            if (notification.nStatus === NotificationStatus.READ) {
                return { notification, wasAlreadyRead: true };
            }

            notification.nStatus = NotificationStatus.READ;
            const updated = await saveFn(notification);
            return { notification: updated, wasAlreadyRead: false };
        };

        let result: { notification: Notification; wasAlreadyRead: boolean };

        if (this.dataSource?.transaction) {
            result = await this.dataSource.transaction(async (manager: EntityManager) => {
                return executeMarkAsRead(
                    (targetId) => manager.findOne(Notification, {
                        where: { id: targetId },
                        lock: { mode: 'pessimistic_write' },
                        relations: ['sender', 'attachments'],
                    }),
                    (entity) => manager.save(entity),
                );
            });
        } else if (this.notificationRepository.manager?.transaction) {
            result = await this.notificationRepository.manager.transaction(async (manager: EntityManager) => {
                return executeMarkAsRead(
                    (targetId) => manager.findOne(Notification, {
                        where: { id: targetId },
                        lock: { mode: 'pessimistic_write' },
                        relations: ['sender', 'attachments'],
                    }),
                    (entity) => manager.save(entity),
                );
            });
        } else {
            result = await executeMarkAsRead(
                (targetId) => this.findOne(targetId),
                (entity) => this.notificationRepository.save(entity),
            );
        }

        const { notification, wasAlreadyRead } = result;

        if (!wasAlreadyRead) {
            // Auditoría solo cuando el cambio de estado se realizó de forma efectiva
            try {
                await this.auditService.createDigitalRecord(userId, {
                    action: AuditAction.UPDATE,
                    tableName: 'notifications',
                    recordId: id,
                    description: `Notificación "${notification.nTitle}" marcada como leída`,
                });
            } catch (e) {
                this.logger.error('Audit error (notifications markAsRead)', sanitizeForLogging({ error: String(e) }));
            }

            // Invalidar caché de listados (versión global) y la de los usuarios implicados
            this.invalidateUnreadCache();
            await this.invalidateUserUnreadCache(userId, notification.idSender);
        }

        return notification;
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
                    this.logger.error('Audit error (notifications remove)', sanitizeForLogging({ error: String(e) }));
                }

                // Invalidar caché de listados (versión global) y la de los usuarios implicados
                this.invalidateUnreadCache();
                await this.invalidateUserUnreadCache(userId, notification.idSender);
            }

    /**
     * Obtener notificaciones no leídas para un usuario específico con caché por usuario
     */
    async getUnreadForUser(userId: number, limit = 10): Promise<Notification[]> {
        if (!userId) {
            return [];
        }

        const cacheKey = `notifications-unread:${userId}`;
        const cached = await this.cacheManager.get<Notification[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const notifications = await this.notificationRepository.find({
            where: {
                idSender: userId,
                nStatus: NotificationStatus.PENDING,
            },
            order: { nSendDate: 'DESC' },
            take: limit,
            relations: ['sender', 'attachments'],
        });

        // Almacenar en caché con TTL de 60 segundos
        await this.cacheManager.set(cacheKey, notifications, 60000);
        return notifications;
    }

    /**
     * Invalida la caché de notificaciones no leídas para usuarios específicos
     */
    private async invalidateUserUnreadCache(...userIds: (number | undefined | null)[]): Promise<void> {
        const uniqueIds = Array.from(new Set(userIds.filter((id): id is number => typeof id === 'number' && id > 0)));
        await Promise.all(
            uniqueIds.map(userId => this.cacheManager.del(`notifications-unread:${userId}`))
        );
    }
}