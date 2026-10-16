import { Injectable, Inject, Optional, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { DataSource, EntityManager, LessThanOrEqual, Repository } from 'typeorm';
import { LoggerService } from '@common/services/logger.service';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';
import { Notification } from '../../domain/notifications';
import { NotificationStatus } from '../../domain/notifications/notification-status.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../domain/audit';

export interface NotificationDispatchResult {
    processed: number;
    sent: number;
    failed: number;
    skipped: number;
}

/**
 * Job de envio programado de notificaciones pendientes (`nSent = false`).
 *
 * Cubre la deuda tecnica "Job de envio programado": procesa por lotes las
 * notificaciones vencidas (`nSendDate <= now`), las marca como enviadas
 * (`nSent = true`, `nStatus = SENT`) y deja los fallos como pendientes para
 * reintento en el siguiente tick.
 *
 * Sin dependencias nuevas (sin Bull/Agenda/Redis): temporizador setInterval
 * configurable por entorno. Este servicio es el punto de anclaje para un
 * sender real o un broker futuro.
 *
 * Env (todas opcionales): NOTIFICATION_DISPATCH_ENABLED (default true),
 * NOTIFICATION_DISPATCH_INTERVAL_MS (default 60000, minimo 5000),
 * NOTIFICATION_DISPATCH_BATCH_SIZE (default 100, rango 1..500).
 */
@Injectable()
export class NotificationDispatchService implements OnModuleInit, OnModuleDestroy {
    private timer?: NodeJS.Timeout;
    private running = false;

    private readonly enabled: boolean;
    private readonly intervalMs: number;
    private readonly batchSize: number;

    constructor(
        private readonly logger: LoggerService,
        @Inject('NotificationRepository')
        private readonly notificationRepository: Repository<Notification>,
        private readonly auditService: AuditService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @Optional()
        private readonly configService?: ConfigService,
        @Optional()
        @Inject('DataSource')
        private readonly dataSource?: DataSource,
    ) {
        this.enabled = this.readBoolean(this.rawEnv('NOTIFICATION_DISPATCH_ENABLED'), true);
        this.intervalMs = this.readInterval(this.rawEnv('NOTIFICATION_DISPATCH_INTERVAL_MS'), 60000);
        this.batchSize = this.readBatchSize(this.rawEnv('NOTIFICATION_DISPATCH_BATCH_SIZE'), 100);
    }

    private rawEnv(key: string): string | undefined {
        const fromConfig = this.configService?.get<string | number | boolean>(key);
        if (fromConfig !== undefined && fromConfig !== null) {
            return String(fromConfig);
        }
        return process.env[key];
    }

    onModuleInit(): void {
        if (!this.enabled) {
            this.logger.log('[NotificationDispatch] job deshabilitado (NOTIFICATION_DISPATCH_ENABLED=false)');
            return;
        }
        if (this.timer) {
            return;
        }
        this.logger.log(
            '[NotificationDispatch] job iniciado',
            sanitizeForLogging({ intervalMs: this.intervalMs, batchSize: this.batchSize }),
        );
        this.timer = setInterval(() => {
            void this.dispatchPendingNotifications().catch((err: unknown) => {
                this.logger.error(
                    '[NotificationDispatch] error no controlado en tick',
                    sanitizeForLogging({ error: err instanceof Error ? err.message : String(err) }),
                );
            });
        }, this.intervalMs);
        (this.timer as unknown as { unref?: () => void }).unref?.();
    }

    onModuleDestroy(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    /**
     * Procesa un lote de pendientes vencidas. Idempotente: las ya enviadas
     * por otro proceso cuentan como `skipped`. Fallos quedan pendientes
     * (`nSent = false`) para reintento en el siguiente tick.
     */
    async dispatchPendingNotifications(now: Date = new Date()): Promise<NotificationDispatchResult> {
        if (this.running) {
            this.logger.warn('[NotificationDispatch] ejecucion solapada omitida');
            return { processed: 0, sent: 0, failed: 0, skipped: 0 };
        }
        this.running = true;
        try {
            const pending = await this.notificationRepository.find({
                where: { nSent: false, nSendDate: LessThanOrEqual(now) },
                order: { nSendDate: 'ASC' },
                take: this.batchSize,
            });

            const result: NotificationDispatchResult = {
                processed: pending.length,
                sent: 0,
                failed: 0,
                skipped: 0,
            };

            for (const item of pending) {
                try {
                    const sent = await this.claimAndMarkAsSent(item.id);
                    if (!sent) {
                        result.skipped++;
                        continue;
                    }
                    result.sent++;
                    await this.bestEffortAudit(sent);
                    await this.bestEffortInvalidateCache(sent.idSender);
                } catch (err) {
                    result.failed++;
                    this.logger.error(
                        '[NotificationDispatch] fallo al despachar',
                        sanitizeForLogging({
                            error: err instanceof Error ? err.message : String(err),
                            notificationId: item.id,
                        }),
                    );
                }
            }

            if (result.processed > 0) {
                this.logger.log('[NotificationDispatch] lote procesado', sanitizeForLogging({ ...result }));
            }
            return result;
        } finally {
            this.running = false;
        }
    }

    /**
     * Reclama con bloqueo pesimista y marca como enviada.
     * Retorna null si ya estaba enviada o no existe (idempotencia).
     */
    private async claimAndMarkAsSent(id: number): Promise<Notification | null> {
        const apply = (entity: Notification | null): Notification | null => {
            if (!entity || entity.nSent) {
                return null;
            }
            entity.nSent = true;
            if (entity.nStatus === NotificationStatus.PENDING || entity.nStatus === NotificationStatus.FAILED) {
                entity.nStatus = NotificationStatus.SENT;
            }
            return entity;
        };

        if (this.dataSource?.transaction) {
            return this.dataSource.transaction(async (manager: EntityManager) => {
                const current = await manager.findOne(Notification, {
                    where: { id },
                    lock: { mode: 'pessimistic_write' },
                });
                const updated = apply(current);
                return updated ? manager.save(updated) : null;
            });
        }

        if (this.notificationRepository.manager?.transaction) {
            return this.notificationRepository.manager.transaction(async (manager: EntityManager) => {
                const current = await manager.findOne(Notification, {
                    where: { id },
                    lock: { mode: 'pessimistic_write' },
                });
                const updated = apply(current);
                return updated ? manager.save(updated) : null;
            });
        }

        const current = await this.notificationRepository.findOne({ where: { id } });
        const updated = apply(current);
        return updated ? this.notificationRepository.save(updated) : null;
    }

    private async bestEffortAudit(notification: Notification): Promise<void> {
        try {
            await this.auditService.createDigitalRecord(notification.idSender, {
                action: AuditAction.UPDATE,
                tableName: 'notifications',
                recordId: notification.id,
                description: `Notificacion "${notification.nTitle}" despachada por job programado`,
            });
        } catch (e) {
            this.logger.error(
                'Audit error (notifications dispatch)',
                sanitizeForLogging({ error: e instanceof Error ? e.message : String(e) }),
            );
        }
    }

    private async bestEffortInvalidateCache(userId: number): Promise<void> {
        try {
            await this.cacheManager.del(`notifications-unread:${userId}`);
        } catch (e) {
            this.logger.error(
                '[NotificationDispatch] no se pudo invalidar cache',
                sanitizeForLogging({ error: e instanceof Error ? e.message : String(e), userId }),
            );
        }
    }

    private readBoolean(raw: string | undefined, fallback: boolean): boolean {
        if (raw === undefined) {
            return fallback;
        }
        const v = raw.trim().toLowerCase();
        if (['false', '0', 'no', 'off', 'disabled'].includes(v)) {
            return false;
        }
        if (['true', '1', 'yes', 'on', 'enabled'].includes(v)) {
            return true;
        }
        return fallback;
    }

    private readInterval(raw: string | undefined, fallback: number): number {
        const parsed = Number(raw ?? fallback);
        if (!Number.isFinite(parsed)) {
            return fallback;
        }
        return Math.max(5000, Math.floor(parsed));
    }

    private readBatchSize(raw: string | undefined, fallback: number): number {
        const parsed = Number(raw ?? fallback);
        if (!Number.isFinite(parsed)) {
            return fallback;
        }
        return Math.min(500, Math.max(1, Math.floor(parsed)));
    }
}
